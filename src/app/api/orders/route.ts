import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendOrderConfirmationEmail, sendOrderConfirmationSMS } from '@/lib/notify';
import { rateLimit, bodyTooLarge, cleanString, isEmail, isPhone, isPincode } from '@/lib/security';

const PROMO_CODES: Record<string, number> = { SAREE10: 0.1, WELCOME15: 0.15 };
const FREE_SHIP_THRESHOLD = 2999;
const SHIP_COST = 99;
const MAX_CART_LINES = 20;

function generateOrderNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ANY${rand}`;
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'order-create', 10, 60 * 60 * 1000);
  if (limited) return limited;

  const oversized = bodyTooLarge(req, 50_000);
  if (oversized) return oversized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const customerName = cleanString(body.customerName, 100);
  const email = cleanString(body.email, 254).toLowerCase();
  const phone = cleanString(body.phone, 20);
  const address = cleanString(body.address, 500);
  const city = cleanString(body.city, 100);
  const state = cleanString(body.state, 100);
  const pincode = cleanString(body.pincode, 10);
  const { paymentMethod, items, promoCode } = body;

  if (customerName.length < 3 || address.length < 5 || city.length < 2 || state.length < 2) {
    return NextResponse.json({ error: 'Missing required shipping details.' }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }
  if (!isPhone(phone)) {
    return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 });
  }
  if (!isPincode(pincode)) {
    return NextResponse.json({ error: 'Invalid pincode.' }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_CART_LINES) {
    return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
  }
  if (!['upi'].includes(paymentMethod)) {
    return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 });
  }

  // Recompute pricing server-side from the database — never trust client-sent totals.
  const productIds = items.map((i: { id: unknown }) => Number(i?.id)).filter((id: number) => Number.isInteger(id) && id > 0);
  if (productIds.length !== items.length) {
    return NextResponse.json({ error: 'Invalid cart items.' }, { status: 400 });
  }
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, active: true } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const orderItemsData: { productId: number; name: string; price: number; qty: number; color: string | null }[] = [];
  for (const item of items) {
    const product = productMap.get(Number(item.id));
    if (!product) {
      return NextResponse.json({ error: 'One of the items in your cart is no longer available.' }, { status: 400 });
    }
    const qty = Math.max(1, Math.min(10, Number(item.qty) || 1));
    subtotal += product.price * qty;
    orderItemsData.push({ productId: product.id, name: product.name, price: product.price, qty, color: cleanString(item.color, 50) || null });
  }

  const normalizedPromo = typeof promoCode === 'string' ? promoCode.trim().toUpperCase() : '';
  const discountRate = PROMO_CODES[normalizedPromo] || 0;
  const discount = Math.round(subtotal * discountRate);
  const shipping = subtotal - discount >= FREE_SHIP_THRESHOLD ? 0 : SHIP_COST;
  const total = subtotal - discount + shipping;

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'Processing',
      subtotal,
      discount,
      shipping,
      total,
      promoCode: discountRate > 0 ? normalizedPromo : null,
      items: { create: orderItemsData },
      statusHistory: { create: { status: 'Processing', note: 'Order placed' } },
    },
    include: { items: true },
  });

  // Best-effort notifications — never fail order placement because of them.
  const notifyPayload = {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    total: order.total,
    paymentMethod: order.paymentMethod,
    items: order.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
  };
  sendOrderConfirmationEmail(notifyPayload).catch(() => {});
  sendOrderConfirmationSMS(notifyPayload).catch(() => {});

  return NextResponse.json({
    orderNumber: order.orderNumber,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.status,
  });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  return NextResponse.json({ orders });
}

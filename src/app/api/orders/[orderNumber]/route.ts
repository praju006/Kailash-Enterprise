import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { sendStatusUpdateNotification } from '@/lib/notify';
import { rateLimit, bodyTooLarge } from '@/lib/security';

const VALID_STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
const VALID_PAYMENT_STATUSES = ['pending', 'awaiting_verification', 'paid', 'failed', 'refunded'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await requireRole(ADMIN_ROLES);

  // Throttle unauthenticated lookups so order numbers can't be enumerated.
  if (!session) {
    const limited = rateLimit(req, 'order-lookup', 30, 10 * 60 * 1000);
    if (limited) return limited;
  }

  const { orderNumber } = await params;
  const contact = req.nextUrl.searchParams.get('contact')?.trim().toLowerCase();

  const order = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.toUpperCase() },
    include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
  });

  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  // Public lookups must prove ownership via email or phone; admins can look up freely.
  if (!session) {
    if (!contact) return NextResponse.json({ error: 'Email or phone required.' }, { status: 400 });
    const matches = order.email.toLowerCase() === contact || order.phone.replace(/\D/g, '').endsWith(contact.replace(/\D/g, ''));
    if (!matches) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const session = await requireRole(ADMIN_ROLES);

  if (!session) {
    const limited = rateLimit(req, 'order-patch', 10, 10 * 60 * 1000);
    if (limited) return limited;
  }

  const { orderNumber } = await params;

  const oversized = bodyTooLarge(req, 10_000);
  if (oversized) return oversized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const { status, paymentStatus, note } = body;

  // Unauthenticated customers may only self-report "I've paid" — nothing else.
  const isCustomerSelfReport = !session && !status && paymentStatus === 'awaiting_verification';
  if (!session && !isCustomerSelfReport) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const order = await prisma.order.findUnique({ where: { orderNumber: orderNumber.toUpperCase() } });
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }
  if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    return NextResponse.json({ error: 'Invalid payment status.' }, { status: 400 });
  }
  const safeNote = typeof note === 'string' ? note.trim().slice(0, 500) : null;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(status ? { statusHistory: { create: { status, note: safeNote || null } } } : {}),
    },
    include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
  });

  if (status) {
    sendStatusUpdateNotification(
      { orderNumber: updated.orderNumber, customerName: updated.customerName, email: updated.email, phone: updated.phone },
      status
    ).catch(() => {});
  }

  return NextResponse.json({ order: updated });
}

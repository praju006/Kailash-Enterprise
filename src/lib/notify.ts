import nodemailer from 'nodemailer';

interface OrderForNotify {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  total: number;
  paymentMethod: string;
  items: { name: string; qty: number; price: number }[];
}

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export async function sendOrderConfirmationEmail(order: OrderForNotify) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(`[email disabled] Would have sent order confirmation for ${order.orderNumber} to ${order.email}`);
    return { sent: false, reason: 'SMTP not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const itemsHtml = order.items
    .map((i) => `<tr><td style="padding:6px 0">${i.name} × ${i.qty}</td><td style="padding:6px 0;text-align:right">${formatINR(i.price * i.qty)}</td></tr>`)
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#2b1810">
      <h2 style="color:#58152a">Thank you for your order, ${order.customerName.split(' ')[0]}!</h2>
      <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">${itemsHtml}</table>
      <p><strong>Total: ${formatINR(order.total)}</strong> (${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()})</p>
      <p>Track your order anytime at kailashenterprises.com/track using order number <strong>${order.orderNumber}</strong>.</p>
      <p style="color:#5a4438;font-size:13px;margin-top:24px">— Kailash Enterprises</p>
    </div>`;

  try {
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: order.email,
      subject: `Order Confirmed — ${order.orderNumber} | Kailash Enterprises`,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
    return { sent: false, reason: 'send failed' };
  }
}

export async function sendOrderConfirmationSMS(order: OrderForNotify) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.log(`[sms disabled] Would have sent order confirmation for ${order.orderNumber} to ${order.phone}`);
    return { sent: false, reason: 'Twilio not configured' };
  }

  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const body = new URLSearchParams({
      To: order.phone.startsWith('+') ? order.phone : `+91${order.phone}`,
      From: TWILIO_FROM_NUMBER,
      Body: `Kailash Enterprises: Your order ${order.orderNumber} (${formatINR(order.total)}) is confirmed! Track it at kailashenterprises.com/track`,
    });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) throw new Error(await res.text());
    return { sent: true };
  } catch (err) {
    console.error('Failed to send order confirmation SMS:', err);
    return { sent: false, reason: 'send failed' };
  }
}

export async function sendStatusUpdateNotification(order: { orderNumber: string; customerName: string; email: string; phone: string }, status: string) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_FROM } = process.env;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transporter.sendMail({
        from: SMTP_FROM || SMTP_USER,
        to: order.email,
        subject: `Order ${order.orderNumber} — ${status} | Kailash Enterprises`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#2b1810">
          <h2 style="color:#58152a">Hi ${order.customerName.split(' ')[0]}, your order is now: ${status}</h2>
          <p>Order <strong>${order.orderNumber}</strong> status has been updated to <strong>${status}</strong>.</p>
          <p>Track it anytime at kailashenterprises.com/track.</p>
        </div>`,
      });
    } catch (err) {
      console.error('Failed to send status update email:', err);
    }
  } else {
    console.log(`[email disabled] Would have notified ${order.email} that ${order.orderNumber} is now "${status}"`);
  }

  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER) {
    try {
      const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
      const body = new URLSearchParams({
        To: order.phone.startsWith('+') ? order.phone : `+91${order.phone}`,
        From: TWILIO_FROM_NUMBER,
        Body: `Kailash Enterprises: Order ${order.orderNumber} is now "${status}". Track at kailashenterprises.com/track`,
      });
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
    } catch (err) {
      console.error('Failed to send status update SMS:', err);
    }
  } else {
    console.log(`[sms disabled] Would have texted ${order.phone} that ${order.orderNumber} is now "${status}"`);
  }
}

// Daraja (M-Pesa) integration helpers.
// Sandbox docs: https://developer.safaricom.co.ke/
// Fill in real credentials in .env before use — these are stubs so Phase 2
// can wire up the actual STK Push flow without redesigning the interface.

const BASE_URL =
  process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

async function getAccessToken() {
  const creds = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` }
  });

  if (!res.ok) throw new Error('Failed to get M-Pesa access token');
  const data = await res.json();
  return data.access_token as string;
}

function timestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export async function initiateStkPush({
  phone,
  amount,
  accountReference
}: {
  phone: string; // format 2547XXXXXXXX
  amount: number;
  accountReference: string; // e.g. subscriptionId
}) {
  const token = await getAccessToken();
  const ts = timestamp();
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${ts}`
  ).toString('base64');

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: ts,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: 'DarasaLive subscription'
    })
  });

  if (!res.ok) throw new Error('STK push request failed');
  return res.json(); // includes CheckoutRequestID — store this on the Subscription row
}

// TODO Phase 2: implement the callback handler in
// src/app/api/mpesa/callback/route.ts to read CheckoutRequestID from the
// callback body, match it to a Subscription, and flip status to ACTIVE/FAILED.

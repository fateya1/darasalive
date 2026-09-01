'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RenewSubscription() {
  const router = useRouter();
  const [plan, setPlan] = useState('monthly');
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleRenew() {
    setStatus('working');
    setMessage('Sending the M-Pesa prompt to your phone…');

    const res = await fetch('/api/subscriptions/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus('error');
      setMessage(data.error ?? 'Something went wrong.');
      return;
    }

    setMessage('Check your phone and enter your M-Pesa PIN to complete payment.');

    let attempts = 0;
    const poll = async (): Promise<void> => {
      attempts += 1;
      const statusRes = await fetch(`/api/subscriptions/${data.subscriptionId}/status`);
      const statusData = await statusRes.json();

      if (statusData.status === 'ACTIVE') {
        setStatus('done');
        setMessage('Payment confirmed — your subscription is active.');
        setTimeout(() => router.refresh(), 1000);
        return;
      }
      if (statusData.status === 'FAILED') {
        setStatus('error');
        setMessage('Payment was not completed. You can try again.');
        return;
      }
      if (attempts >= 20) {
        setStatus('error');
        setMessage('Still waiting on confirmation — check back shortly.');
        return;
      }
      setTimeout(poll, 3000);
    };

    poll();
  }

  return (
    <div className="border-l-2 border-gold pl-4 py-2 max-w-sm">
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        disabled={status === 'working'}
        className="w-full border-b border-ink/20 py-2 bg-transparent focus:border-gold outline-none text-sm"
      >
        <option value="monthly">Monthly — KES 300</option>
        <option value="semi-annual">Semi-annual — KES 400</option>
        <option value="annual">Annual — KES 700</option>
      </select>

      {message && <p className="text-sm text-ink/70 mt-3">{message}</p>}

      <button
        onClick={handleRenew}
        disabled={status === 'working'}
        className="mt-3 bg-gold hover:bg-gold-dark disabled:opacity-50 text-ink px-5 py-2 rounded-full text-sm"
      >
        {status === 'working' ? 'Please wait…' : 'Renew subscription'}
      </button>
    </div>
  );
}

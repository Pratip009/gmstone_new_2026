'use client';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface ShippingForm {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

const EMPTY_FORM: ShippingForm = {
  fullName: '', addressLine1: '', addressLine2: '',
  city: '', state: '', postalCode: '', country: 'US', phone: '',
};

export default function CheckoutPage() {
  const { apiFetch } = useApi();
  const router = useRouter();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    apiFetch('/api/cart')
      .then((d) => setTotal(d.data.totals?.total || 0))
      .catch(() => router.push('/login'));
  }, []);

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Create order (COD initially, PayPal will update)
      const data = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress: form, paymentMethod: 'paypal' }),
      });
      setOrderId(data.data._id);
      setStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const createPayPalOrder = async () => {
    const data = await apiFetch('/api/payment/paypal/create', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
    return data.data.paypalOrderId;
  };

  const onPayPalApprove = async (data: { orderID: string }) => {
    try {
      await apiFetch('/api/payment/paypal/capture', {
        method: 'POST',
        body: JSON.stringify({ paypalOrderId: data.orderID }),
      });
      router.push(`/orders?success=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment capture failed');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {['shipping', 'payment'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-neutral-700" />}
            <div className={`flex items-center gap-2 text-sm ${step === s ? 'text-amber-400' : 'text-neutral-600'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-600'}`}>
                {i + 1}
              </div>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          </div>
        ))}
      </div>

      {step === 'shipping' && (
        <form onSubmit={handleShippingSubmit} className="space-y-4">
          {(Object.keys(EMPTY_FORM) as (keyof ShippingForm)[]).map((field) => (
            <div key={field}>
              <label className="label">
                {field.replace(/([A-Z])/g, ' $1').trim()}
                {field === 'addressLine2' || field === 'phone' ? ' (optional)' : ''}
              </label>
              <input
                className="input"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required={field !== 'addressLine2' && field !== 'phone'}
              />
            </div>
          ))}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Saving…' : `Continue to Payment • $${total.toFixed(2)}`}
          </button>
        </form>
      )}

      {step === 'payment' && orderId && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-neutral-200">Complete Payment</h2>
          <p className="text-neutral-400 text-sm">
            Total: <span className="text-amber-400 font-bold text-lg">${total.toFixed(2)}</span>
          </p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <PayPalScriptProvider
            options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test', currency: 'USD' }}
          >
            <PayPalButtons
              createOrder={createPayPalOrder}
              onApprove={onPayPalApprove}
              onError={(err) => setError(String(err))}
              style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
            />
          </PayPalScriptProvider>
          <button onClick={() => setStep('shipping')} className="btn-secondary w-full text-sm">
            ← Back to Shipping
          </button>
        </div>
      )}
    </div>
  );
}

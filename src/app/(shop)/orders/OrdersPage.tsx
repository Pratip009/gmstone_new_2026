'use client';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400',
  paid: 'text-green-400',
  processing: 'text-blue-400',
  shipped: 'text-purple-400',
  delivered: 'text-green-400',
  cancelled: 'text-red-400',
};

export default function OrdersPage() {
  const { apiFetch } = useApi();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const success = searchParams.get('success');

  useEffect(() => {
    apiFetch('/api/orders')
      .then((d) => setOrders(d.data || []))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-neutral-500 py-20 text-center">Loading orders…</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {success && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-lg p-4 mb-6">
          ✓ Payment successful! Your order has been placed.
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <div className="text-4xl mb-4">📦</div>
          <p>No orders yet.</p>
          <Link href="/products" className="btn-primary inline-block mt-4">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-neutral-500 font-mono">{order._id}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-bold">${order.totalAmount.toLocaleString()}</p>
                  <span className={`text-xs font-medium ${STATUS_COLORS[order.status] || 'text-neutral-400'}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-sm text-neutral-400 space-y-0.5">
                {order.items.map((item, i) => (
                  <p key={i}>
                    {item.quantity}× {item.name} — ${item.price.toLocaleString()}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

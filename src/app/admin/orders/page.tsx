'use client';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import Link from 'next/link';

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
}

const STATUS_OPTIONS = ['pending','paid','processing','shipped','delivered','cancelled','refunded'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-900/30',
  paid: 'text-green-400 bg-green-900/30',
  processing: 'text-blue-400 bg-blue-900/30',
  shipped: 'text-purple-400 bg-purple-900/30',
  delivered: 'text-green-400 bg-green-900/30',
  cancelled: 'text-red-400 bg-red-900/30',
  refunded: 'text-orange-400 bg-orange-900/30',
};

export default function AdminOrdersPage() {
  const { apiFetch } = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/orders${filterStatus ? `?status=${filterStatus}` : ''}`;
      const data = await apiFetch(url);
      setOrders(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await apiFetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-neutral-500 text-sm hover:text-white">← Admin</Link>
          <h1 className="text-2xl font-bold mt-1">Orders</h1>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-sm rounded px-3 py-1.5"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-neutral-500 py-12 text-center">Loading…</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-800">
              <tr className="text-neutral-500 text-xs uppercase tracking-wider">
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Update'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                    {order._id.slice(-8)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-neutral-200 text-xs font-medium">{order.user?.name}</p>
                    <p className="text-neutral-500 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ').slice(0, 40)}
                    {order.items.reduce((a, i) => a + i.name.length, 0) > 40 ? '…' : ''}
                  </td>
                  <td className="px-4 py-3 text-amber-400 font-bold">
                    ${order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-neutral-400 uppercase">{order.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updating === order._id}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs rounded px-2 py-1"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-neutral-600">No orders found</div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface FedExShipment {
  trackingNumber: string;
  serviceType: string;
  estimatedDelivery?: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  fedex?: FedExShipment;
}

interface TrackingEvent {
  timestamp: string;
  eventType: string;
  description: string;
  location?: string;
}

interface TrackingData {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: TrackingEvent[];
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  pending:    { label: 'Pending',    classes: 'bg-amber-50 text-amber-700 border border-amber-200',    dot: 'bg-amber-400' },
  paid:       { label: 'Paid',       classes: 'bg-green-50 text-green-700 border border-green-200',    dot: 'bg-green-400' },
  processing: { label: 'Processing', classes: 'bg-blue-50 text-blue-700 border border-blue-200',       dot: 'bg-blue-400' },
  shipped:    { label: 'Shipped',    classes: 'bg-purple-50 text-purple-700 border border-purple-200', dot: 'bg-purple-400' },
  delivered:  { label: 'Delivered',  classes: 'bg-green-50 text-green-700 border border-green-200',    dot: 'bg-green-400' },
  cancelled:  { label: 'Cancelled',  classes: 'bg-red-50 text-red-700 border border-red-200',          dot: 'bg-red-400' },
};

const STEP_ORDER = ['pending', 'processing', 'shipped', 'delivered'];
const ITEM_EMOJIS = ['💎', '💍', '🌟', '✨', '🪙'];

const FEDEX_STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  OD: { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Out for Delivery' },
  DL: { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Delivered' },
  IT: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'In Transit' },
  PU: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Picked Up' },
  OC: { bg: 'bg-stone-50',  text: 'text-stone-500',  label: 'Label Created' },
};

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600 border border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function TrackingBar({ status }: { status: string }) {
  const current = STEP_ORDER.indexOf(status);
  return (
    <div className="flex items-center gap-0">
      {STEP_ORDER.map((_, i) => {
        const done = i <= current;
        return (
          <div key={i} className="flex items-center">
            {i > 0 && <div className={`w-7 h-px ${done ? 'bg-green-400' : 'bg-stone-200'}`} />}
            <div className={`w-2 h-2 rounded-full transition-colors ${done ? 'bg-green-400' : 'bg-stone-200'}`} />
          </div>
        );
      })}
    </div>
  );
}

// ─── FedEx Tracking Widget (NEW) ──────────────────────────────────────────────
function FedExTracker({ orderId, fedex }: { orderId: string; fedex?: FedExShipment }) {
  const { apiFetch } = useApi();
  const [data, setData]           = useState<TrackingData | null>(null);
  const [open, setOpen]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  if (!fedex?.trackingNumber) {
    // No label yet — show a subtle note only for paid/processing orders
    return (
      <p className="text-xs text-stone-400 italic">
        Shipment label being prepared…
      </p>
    );
  }

  async function handleToggle() {
    if (open) { setOpen(false); return; }
    if (data)  { setOpen(true); return; }

    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch(`/api/orders/${orderId}/tracking`);
      setData(result.data);
      setOpen(true);
    } catch (err) {
      setError('Could not load tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const badge = data ? (FEDEX_STATUS_BADGE[data.status] ?? { bg: 'bg-stone-50', text: 'text-stone-500', label: data.statusDescription }) : null;

  return (
    <div className="space-y-2.5">
      {/* Tracking number row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* FedEx wordmark approximation */}
          <span className="text-[0.6rem] font-black tracking-tight shrink-0">
            <span className="text-[#4d148c]">Fed</span><span className="text-[#ff6600]">Ex</span>
          </span>
          <span className="font-mono text-xs text-stone-500 truncate">{fedex.trackingNumber}</span>
          {fedex.serviceType && (
            <span className="hidden sm:inline text-[0.6rem] text-stone-400 bg-stone-100 rounded px-1.5 py-0.5 shrink-0">
              {fedex.serviceType.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className="shrink-0 text-[0.68rem] font-semibold text-amber-700 border border-amber-200 bg-amber-50 rounded-lg px-2.5 py-1 hover:bg-amber-100 disabled:opacity-50 transition-all"
        >
          {loading ? 'Loading…' : open ? 'Hide ↑' : 'Track →'}
        </button>
      </div>

      {/* Estimated delivery (always shown) */}
      {fedex.estimatedDelivery && !data && (
        <p className="text-xs text-stone-400">
          Estimated delivery: <span className="font-medium text-stone-600">{new Date(fedex.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </p>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Tracking detail panel */}
      {open && data && (
        <div className="rounded-xl border border-stone-100 bg-stone-50 p-3.5 space-y-3">

          {/* Status + delivery */}
          <div className="flex items-start justify-between gap-2">
            {badge && (
              <span className={`inline-flex items-center gap-1.5 text-[0.68rem] font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {badge.label}
              </span>
            )}
            {data.actualDelivery ? (
              <span className="text-xs text-green-600 font-medium">
                ✓ Delivered {new Date(data.actualDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ) : data.estimatedDelivery ? (
              <span className="text-xs text-stone-400">
                Est. {new Date(data.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ) : null}
          </div>

          {/* Event timeline */}
          {data.events.length > 0 ? (
            <ol className="relative border-l-2 border-stone-200 space-y-3 ml-1">
              {data.events.slice(0, 5).map((ev, i) => (
                <li key={i} className="ml-4">
                  <div className={`absolute -left-[5px] mt-1 h-2.5 w-2.5 rounded-full border-2 border-white ${i === 0 ? 'bg-amber-500' : 'bg-stone-300'}`} />
                  <p className="text-[0.6rem] text-stone-400 mb-0.5">
                    {new Date(ev.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    {ev.location && <span className="ml-1.5">· {ev.location}</span>}
                  </p>
                  <p className="text-xs font-medium text-stone-700">{ev.description}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-stone-400 italic">No scan events yet. Check back soon.</p>
          )}

          {/* FedEx link */}
          <a
            href={`https://www.fedex.com/fedextrack/?trknbr=${fedex.trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[0.65rem] text-amber-700 hover:underline"
          >
            View full tracking on FedEx.com →
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-stone-400 text-sm">
      Loading orders…
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="px-6 pt-10 pb-6 border-b border-stone-100 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-light text-stone-900 tracking-tight">
            My <span className="italic text-amber-700">Orders</span>
          </h1>
          <p className="text-sm text-stone-400 mt-1.5 tracking-wide">Track and manage your purchases</p>
        </div>
        <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full tracking-widest uppercase">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* Success banner */}
      {success && (
        <div className="mx-6 mt-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3.5">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs">✓</div>
          <p className="text-sm text-green-700 font-medium">Payment successful — your order has been placed and your shipping label is being prepared.</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-stone-400">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-base mb-6">No orders yet</p>
          <Link href="/products" className="bg-stone-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-stone-800 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="px-6 pb-12">

          {/* Stats */}
          <div className="grid grid-cols-3 mt-6 mb-6 rounded-xl overflow-hidden border border-stone-100 divide-x divide-stone-100">
            {[
              { label: 'Total spent',     value: `$${totalSpent.toLocaleString()}` },
              { label: 'Orders placed',   value: orders.length },
              { label: 'Items purchased', value: totalItems },
            ].map(({ label, value }) => (
              <div key={label} className="bg-stone-50 px-5 py-4">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-light text-stone-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Order cards */}
          <div className="flex flex-col gap-3">
            {orders.map((order, oi) => (
              <div key={order._id} className="border border-stone-100 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all">

                {/* Card header */}
                <div className="px-5 pt-5 pb-4 flex items-start justify-between border-b border-stone-50">
                  <div>
                    <p className="text-xs font-mono text-stone-400 tracking-wide uppercase">
                      #{order._id.slice(-12)}
                    </p>
                    <p className="text-sm text-stone-500 mt-1 flex items-center gap-1.5">
                      <span className="text-stone-300">📅</span>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light text-stone-900 tracking-tight">
                      ${order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">order total</p>
                  </div>
                </div>

                {/* Status + progress bar */}
                <div className="px-5 py-3 flex items-center justify-between bg-stone-50/50">
                  <StatusPill status={order.status} />
                  <TrackingBar status={order.status} />
                </div>

                <div className="border-t border-stone-50" />

                {/* Items */}
                <div className="px-5 py-4 flex flex-col gap-3">
                  {order.items.map((item, ii) => (
                    <div key={ii} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-base flex-shrink-0">
                          {ITEM_EMOJIS[(oi + ii) % ITEM_EMOJIS.length]}
                        </div>
                        <div>
                          <p className="text-sm text-stone-700">{item.name}</p>
                          <p className="text-xs text-stone-400 mt-0.5">Qty {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-stone-600">${item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                {/* FedEx tracking section (NEW — replaces static footer) */}
                {(order.fedex || ['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) && (
                  <div className="border-t border-stone-100 px-5 py-4 bg-stone-50/40">
                    <FedExTracker orderId={order._id} fedex={order.fedex} />
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
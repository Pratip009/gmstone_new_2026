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

// ── Country list ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'PH', name: 'Philippines' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
];

// ── US states ─────────────────────────────────────────────────────────────────
const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],
  ['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['FL','Florida'],['GA','Georgia'],
  ['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],
  ['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],
  ['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],
  ['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],
  ['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],
  ['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],
  ['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],
  ['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
  ['DC','Washington D.C.'],
];

// ── Canadian provinces ────────────────────────────────────────────────────────
const CA_PROVINCES = [
  ['AB','Alberta'],['BC','British Columbia'],['MB','Manitoba'],['NB','New Brunswick'],
  ['NL','Newfoundland and Labrador'],['NS','Nova Scotia'],['NT','Northwest Territories'],
  ['NU','Nunavut'],['ON','Ontario'],['PE','Prince Edward Island'],['QC','Quebec'],
  ['SK','Saskatchewan'],['YT','Yukon'],
];

// ── Postal-code pattern per country ──────────────────────────────────────────
const POSTAL_PATTERNS: Record<string, { pattern: RegExp; hint: string }> = {
  US: { pattern: /^\d{5}(-\d{4})?$/, hint: '12345 or 12345-6789' },
  CA: { pattern: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, hint: 'A1B 2C3' },
  GB: { pattern: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/, hint: 'SW1A 1AA' },
  AU: { pattern: /^\d{4}$/, hint: '2000' },
  IN: { pattern: /^\d{6}$/, hint: '110001' },
};

// ── Validation helpers ────────────────────────────────────────────────────────
type FormErrors = Partial<Record<keyof ShippingForm, string>>;

function validateForm(form: ShippingForm): FormErrors {
  const errors: FormErrors = {};

  // Full name: at least two words, letters/spaces/hyphens only
  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (!/^[A-Za-z\u00C0-\u024F\s'\-]{2,}$/.test(form.fullName.trim())) {
    errors.fullName = 'Enter a valid name (letters, spaces, hyphens only).';
  } else if (form.fullName.trim().split(/\s+/).length < 2) {
    errors.fullName = 'Please enter your first and last name.';
  }

  // Address line 1
  if (!form.addressLine1.trim()) {
    errors.addressLine1 = 'Street address is required.';
  } else if (form.addressLine1.trim().length < 5) {
    errors.addressLine1 = 'Enter a complete street address.';
  } else if (!/\d/.test(form.addressLine1)) {
    errors.addressLine1 = 'Address should include a street number.';
  }

  // City
  if (!form.city.trim()) {
    errors.city = 'City is required.';
  } else if (!/^[A-Za-z\u00C0-\u024F\s'\-\.]{2,}$/.test(form.city.trim())) {
    errors.city = 'Enter a valid city name.';
  }

  // State (required for US and CA)
  if ((form.country === 'US' || form.country === 'CA') && !form.state) {
    errors.state = form.country === 'US' ? 'State is required.' : 'Province is required.';
  }

  // Postal code
  if (!form.postalCode.trim()) {
    errors.postalCode = 'Postal code is required.';
  } else {
    const rule = POSTAL_PATTERNS[form.country];
    if (rule && !rule.pattern.test(form.postalCode.trim())) {
      errors.postalCode = `Invalid format. Expected: ${rule.hint}`;
    }
  }

  // Country
  if (!form.country) {
    errors.country = 'Please select a country.';
  }

  // Phone (optional, but if provided must be valid)
  if (form.phone.trim()) {
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      errors.phone = 'Enter a valid phone number (7–15 digits).';
    }
  }

  return errors;
}

// ── Phone formatter ───────────────────────────────────────────────────────────
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 15);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `+${digits.slice(0, digits.length - 10)} (${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
}

// ── Postal-code formatter ─────────────────────────────────────────────────────
function formatPostal(value: string, country: string): string {
  if (country === 'US') {
    const d = value.replace(/\D/g, '').slice(0, 9);
    if (d.length > 5) return `${d.slice(0, 5)}-${d.slice(5)}`;
    return d;
  }
  if (country === 'CA') {
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    if (clean.length > 3) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
    return clean;
  }
  return value.toUpperCase().slice(0, 10);
}

// ── Field label map ───────────────────────────────────────────────────────────
const LABELS: Record<keyof ShippingForm, string> = {
  fullName: 'Full Name',
  addressLine1: 'Street Address',
  addressLine2: 'Apt / Suite / Unit',
  city: 'City',
  state: 'State / Province',
  postalCode: 'Postal Code',
  country: 'Country',
  phone: 'Phone Number',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 0a6 6 0 100 12A6 6 0 006 0zm.75 9H5.25V7.5h1.5V9zm0-3H5.25V3h1.5v3z"/>
      </svg>
      {msg}
    </p>
  );
}

function FieldSuccess({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
        <path d="M13.485 1.929a1 1 0 010 1.414L6.343 10.485a1 1 0 01-1.414 0L1.515 7.07a1 1 0 011.414-1.414L5.636 8.364l6.435-6.435a1 1 0 011.414 0z"/>
      </svg>
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { apiFetch } = useApi();
  const router = useRouter();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [form, setForm] = useState<ShippingForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingForm, boolean>>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    apiFetch('/api/cart')
      .then((d) => setTotal(d.data.totals?.total || 0))
      .catch(() => router.push('/login'));
  }, []);

  // Re-validate on form change (only for touched fields)
  useEffect(() => {
    const newErrors = validateForm(form);
    setErrors((prev) => {
      const updated: FormErrors = { ...prev };
      (Object.keys(newErrors) as (keyof ShippingForm)[]).forEach((k) => {
        if (touched[k]) updated[k] = newErrors[k];
      });
      // Clear errors for fields that are now valid and were touched
      (Object.keys(touched) as (keyof ShippingForm)[]).forEach((k) => {
        if (!newErrors[k]) delete updated[k];
      });
      return updated;
    });
  }, [form, touched]);

  // When country changes, reset state and postal code
  const handleCountryChange = (country: string) => {
    setForm((f) => ({ ...f, country, state: '', postalCode: '' }));
    setTouched((t) => ({ ...t, country: true }));
  };

  const handleBlur = (field: keyof ShippingForm) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const newErrors = validateForm(form);
    setErrors((prev) => ({ ...prev, [field]: newErrors[field] }));
  };

  const handleChange = (field: keyof ShippingForm, value: string) => {
    let processed = value;
    if (field === 'phone') processed = value; // raw input; formatter runs on display
    if (field === 'postalCode') processed = formatPostal(value, form.country);
    if (field === 'fullName' || field === 'city') {
      // Prevent numbers / special chars being typed
      processed = value.replace(/[^A-Za-z\u00C0-\u024F\s'\-\.]/g, '');
    }
    setForm((f) => ({ ...f, [field]: processed }));
  };

  const handlePhoneChange = (raw: string) => {
    // Store digits only, display formatted
    const digits = raw.replace(/\D/g, '').slice(0, 15);
    setForm((f) => ({ ...f, phone: digits }));
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all fields touched
    const allTouched = Object.keys(EMPTY_FORM).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof ShippingForm, boolean>
    );
    setTouched(allTouched);

    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setApiError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress: form, paymentMethod: 'paypal' }),
      });
      setOrderId(data.data._id);
      setStep('payment');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create order');
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
      setApiError(err instanceof Error ? err.message : 'Payment capture failed');
    }
  };

  // Determine whether to show a state/province dropdown
  const showStateDropdown = form.country === 'US' || form.country === 'CA';
  const stateOptions = form.country === 'US' ? US_STATES : CA_PROVINCES;
  const stateLabel = form.country === 'CA' ? 'Province' : 'State';

  const inputBase =
    'w-full bg-white border rounded-lg px-3 py-2.5 text-sm text-gray-900 ' +
    'placeholder-gray-400 outline-none transition-colors shadow-sm';
  const inputNormal = `${inputBase} border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100`;
  const inputError = `${inputBase} border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50`;
  const inputValid = `${inputBase} border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100`;

  const getInputClass = (field: keyof ShippingForm) => {
    if (errors[field]) return inputError;
    if (touched[field] && !errors[field] && (form[field] || field === 'addressLine2' || field === 'phone'))
      return inputValid;
    return inputNormal;
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-12">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Checkout</h1>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {['shipping', 'payment'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-gray-300" />}
            <div className={`flex items-center gap-2 text-sm ${step === s ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step === s ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {i + 1}
              </div>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          </div>
        ))}
      </div>

      {step === 'shipping' && (
        <form onSubmit={handleShippingSubmit} noValidate className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {LABELS.fullName} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                className={getInputClass('fullName')}
                placeholder="Jane Smith"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                autoComplete="name"
              />
              <FieldSuccess show={!!(touched.fullName && !errors.fullName && form.fullName)} />
            </div>
            <FieldError msg={errors.fullName} />
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {LABELS.country} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                className={`${getInputClass('country')} appearance-none pr-8 cursor-pointer`}
                value={form.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                onBlur={() => handleBlur('country')}
              >
                <option value="">Select country…</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 6l4 4 4-4"/>
                </svg>
              </span>
            </div>
            <FieldError msg={errors.country} />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {LABELS.addressLine1} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                className={getInputClass('addressLine1')}
                placeholder="123 Main Street"
                value={form.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                onBlur={() => handleBlur('addressLine1')}
                autoComplete="address-line1"
              />
              <FieldSuccess show={!!(touched.addressLine1 && !errors.addressLine1 && form.addressLine1)} />
            </div>
            <FieldError msg={errors.addressLine1} />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {LABELS.addressLine2}{' '}
              <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <input
              className={inputNormal}
              placeholder="Apt 4B, Floor 2, etc."
              value={form.addressLine2}
              onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))}
              autoComplete="address-line2"
            />
          </div>

          {/* City + State row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {LABELS.city} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className={getInputClass('city')}
                  placeholder="New York"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  autoComplete="address-level2"
                />
                <FieldSuccess show={!!(touched.city && !errors.city && form.city)} />
              </div>
              <FieldError msg={errors.city} />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {showStateDropdown ? stateLabel : LABELS.state}
                {showStateDropdown && <span className="text-red-500"> *</span>}
              </label>
              {showStateDropdown ? (
                <div className="relative">
                  <select
                    className={`${getInputClass('state')} appearance-none pr-8 cursor-pointer`}
                    value={form.state}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, state: e.target.value }));
                      setTouched((t) => ({ ...t, state: true }));
                    }}
                    onBlur={() => handleBlur('state')}
                  >
                    <option value="">Select…</option>
                    {stateOptions.map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 6l4 4 4-4"/>
                    </svg>
                  </span>
                </div>
              ) : (
                <input
                  className={getInputClass('state')}
                  placeholder="State / Region"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  onBlur={() => handleBlur('state')}
                  autoComplete="address-level1"
                />
              )}
              <FieldError msg={errors.state} />
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {LABELS.postalCode} <span className="text-red-500">*</span>
              {POSTAL_PATTERNS[form.country] && (
                <span className="text-gray-400 ml-1 text-xs">
                  ({POSTAL_PATTERNS[form.country].hint})
                </span>
              )}
            </label>
            <div className="relative">
              <input
                className={getInputClass('postalCode')}
                placeholder={POSTAL_PATTERNS[form.country]?.hint || 'Postal code'}
                value={form.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                onBlur={() => handleBlur('postalCode')}
                autoComplete="postal-code"
              />
              <FieldSuccess show={!!(touched.postalCode && !errors.postalCode && form.postalCode)} />
            </div>
            <FieldError msg={errors.postalCode} />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {LABELS.phone}{' '}
              <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <div className="relative">
              <input
                className={getInputClass('phone')}
                type="tel"
                placeholder="(555) 123-4567"
                value={form.phone ? formatPhone(form.phone) : ''}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleBlur('phone')}
                autoComplete="tel"
              />
              <FieldSuccess show={!!(touched.phone && !errors.phone && form.phone)} />
            </div>
            <FieldError msg={errors.phone} />
          </div>

          {/* Error count summary */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
              Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} before continuing.
            </div>
          )}

          {apiError && (
            <p className="text-red-500 text-sm">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : `Continue to Payment • $${total.toFixed(2)}`}
          </button>
        </form>
      )}

      {step === 'payment' && orderId && (
        <div className="card p-6 space-y-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h2 className="font-semibold text-gray-800">Complete Payment</h2>
          <p className="text-gray-500 text-sm">
            Total: <span className="text-amber-600 font-bold text-lg">${total.toFixed(2)}</span>
          </p>
          {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
          <PayPalScriptProvider
            options={{
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
              currency: 'USD',
            }}
          >
            <PayPalButtons
              createOrder={createPayPalOrder}
              onApprove={onPayPalApprove}
              onError={(err) => setApiError(String(err))}
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
'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      const redirect = searchParams.get('redirect') || '/products';
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #faf9f7;
        }

        /* ── Left panel ── */
        .auth-left {
          display: none;
          position: relative;
          width: 48%;
          background: #0e1219;
          overflow: hidden;
          flex-direction: column;
          justify-content: flex-end;
          padding: 56px 52px;
        }

        @media (min-width: 900px) { .auth-left { display: flex; } }

        /* Geometric gem background */
        .auth-gem-bg {
          position: absolute;
          inset: 0;
          opacity: 0.07;
          background-image:
            repeating-linear-gradient(60deg, rgba(212,180,90,0.6) 0px, rgba(212,180,90,0.6) 0.5px, transparent 0.5px, transparent 60px),
            repeating-linear-gradient(-60deg, rgba(212,180,90,0.6) 0px, rgba(212,180,90,0.6) 0.5px, transparent 0.5px, transparent 60px),
            repeating-linear-gradient(0deg, rgba(212,180,90,0.3) 0px, rgba(212,180,90,0.3) 0.5px, transparent 0.5px, transparent 60px);
        }

        /* Radial glow */
        .auth-glow {
          position: absolute;
          width: 500px; height: 500px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,180,90,0.10) 0%, transparent 70%);
          animation: authPulse 5s ease-in-out infinite;
        }

        @keyframes authPulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.12); }
        }

        .auth-gem-svg {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -55%);
          animation: authFloat 7s ease-in-out infinite;
        }

        @keyframes authFloat {
          0%, 100% { transform: translate(-50%, -55%); }
          50%       { transform: translate(-50%, -58%); }
        }

        .auth-left-content {
          position: relative;
          z-index: 2;
        }

        .auth-brand {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(212,180,90,0.7);
          margin-bottom: 18px;
        }

        .auth-left-headline {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 400;
          line-height: 1.25;
          color: #f0e8d0;
          margin: 0 0 16px;
        }

        .auth-left-sub {
          font-size: 14px;
          font-weight: 300;
          color: rgba(240,232,208,0.42);
          line-height: 1.7;
          max-width: 300px;
        }

        .auth-left-rule {
          width: 48px; height: 0.5px;
          background: rgba(212,180,90,0.5);
          margin-bottom: 20px;
        }

        /* ── Right panel ── */
        .auth-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: #faf9f7;
        }

        .auth-form-shell {
          width: 100%;
          max-width: 380px;
          animation: authSlideUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Mobile brand */
        .auth-mobile-brand {
          font-family: 'Playfair Display', serif;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #b8922a;
          margin-bottom: 32px;
          display: block;
        }

        @media (min-width: 900px) { .auth-mobile-brand { display: none; } }

        .auth-heading {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 400;
          color: #1a1612;
          margin: 0 0 6px;
          animation: authSlideUp 0.65s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-subheading {
          font-size: 14px;
          font-weight: 300;
          color: #8a8070;
          margin: 0 0 36px;
          animation: authSlideUp 0.65s 0.14s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* ── Fields ── */
        .auth-field {
          margin-bottom: 22px;
          animation: authSlideUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-field:nth-child(1) { animation-delay: 0.18s; }
        .auth-field:nth-child(2) { animation-delay: 0.24s; }

        .auth-label {
          display: block;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6b5e4a;
          margin-bottom: 8px;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #1a1612;
          background: #fff;
          border: 1px solid #e0d8cc;
          border-radius: 3px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .auth-input:focus {
          border-color: #b8922a;
          box-shadow: 0 0 0 3px rgba(184,146,42,0.10);
        }

        .auth-input::placeholder { color: #c4b9a8; }

        /* Animated underline bar */
        .auth-input-bar {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, #b8922a, #e8c96a);
          border-radius: 0 0 3px 3px;
          transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
        }

        .auth-input:focus + .auth-input-bar { width: 100%; }

        /* ── Error ── */
        .auth-error {
          font-size: 12.5px;
          color: #c0392b;
          background: rgba(192,57,43,0.06);
          border-left: 2px solid rgba(192,57,43,0.35);
          padding: 9px 12px;
          border-radius: 0 3px 3px 0;
          margin-bottom: 20px;
          animation: authSlideUp 0.3s ease both;
        }

        /* ── Submit ── */
        .auth-btn {
          width: 100%;
          height: 50px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #faf9f7;
          background: #1a1612;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.25s, transform 0.15s;
          animation: authSlideUp 0.65s 0.30s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-btn:not(:disabled):hover {
          background: #2c2418;
          transform: translateY(-1px);
        }

        .auth-btn:not(:disabled):active { transform: translateY(0); }

        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Shimmer on hover */
        .auth-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -80px; bottom: 0; width: 60px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent);
          transform: skewX(-15deg);
          transition: none;
        }

        .auth-btn:not(:disabled):hover::after {
          animation: authBtnShimmer 0.55s ease forwards;
        }

        @keyframes authBtnShimmer {
          to { left: 110%; }
        }

        /* Spinner */
        .auth-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 1.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: authSpin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes authSpin { to { transform: rotate(360deg); } }

        /* ── Footer link ── */
        .auth-footer {
          margin-top: 28px;
          font-size: 13px;
          color: #9a8e7e;
          text-align: center;
          animation: authSlideUp 0.65s 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-footer a {
          color: #b8922a;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .auth-footer a:hover { color: #8a6a1a; }

        /* Divider with text */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
          animation: authSlideUp 0.65s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-divider-line { flex: 1; height: 0.5px; background: #e0d8cc; }
        .auth-divider-text { font-size: 11px; color: #b0a494; letter-spacing: 0.08em; }
      `}</style>

      <div className="auth-root">
        {/* ── Left panel ── */}
        <div className="auth-left">
          <div className="auth-gem-bg" />
          <div className="auth-glow" />

          {/* Large gem SVG */}
          <div className="auth-gem-svg">
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
              <polygon points="110,16 196,60 196,160 110,204 24,160 24,60"
                fill="rgba(212,180,90,0.07)" stroke="rgba(212,180,90,0.28)" strokeWidth="0.8" />
              <polygon points="110,16 154,60 110,88 66,60"
                fill="rgba(240,225,180,0.10)" stroke="rgba(212,180,90,0.22)" strokeWidth="0.6" />
              <polygon points="154,60 196,60 196,130 110,88"
                fill="rgba(180,150,70,0.07)" stroke="rgba(212,180,90,0.15)" strokeWidth="0.5" />
              <polygon points="196,130 196,160 110,204 110,88"
                fill="rgba(140,115,55,0.09)" stroke="rgba(212,180,90,0.13)" strokeWidth="0.5" />
              <polygon points="66,60 24,60 24,130 110,88"
                fill="rgba(200,170,80,0.07)" stroke="rgba(212,180,90,0.15)" strokeWidth="0.5" />
              <polygon points="24,130 24,160 110,204 110,88"
                fill="rgba(160,130,60,0.08)" stroke="rgba(212,180,90,0.12)" strokeWidth="0.5" />
              <ellipse cx="90" cy="42" rx="10" ry="5" fill="rgba(255,248,210,0.45)" transform="rotate(-18 90 42)" />
              <circle cx="110" cy="110" r="3" fill="rgba(255,240,180,0.35)" />
            </svg>
          </div>

          <div className="auth-left-content">
            <div className="auth-brand">Alpha Imports</div>
            <div className="auth-left-rule" />
            <h2 className="auth-left-headline">
              Rare diamonds.<br />Singular beauty.
            </h2>
            <p className="auth-left-sub">
              Access our curated collection of certified fancy-colour and white diamonds, sourced from the world's finest cutting centres.
            </p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="auth-right">
          <div className="auth-form-shell">
            <span className="auth-mobile-brand">Alpha Imports</span>

            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subheading">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <div className="auth-input-bar" />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={form.password}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <div className="auth-input-bar" />
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" disabled={loading} className="auth-btn">
                {loading && <span className="auth-spinner" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">New here?</span>
              <div className="auth-divider-line" />
            </div>

            <div className="auth-footer">
              Don&apos;t have an account?{' '}
              <Link href="/signup">Create one</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
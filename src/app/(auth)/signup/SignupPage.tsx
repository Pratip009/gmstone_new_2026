"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      const redirect = searchParams.get("redirect") || "/products";
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: keyof typeof form; label: string; type: string; placeholder: string; delay: string }[] = [
    { key: 'name',     label: 'Full name',       type: 'text',     placeholder: 'Your name',        delay: '0.18s' },
    { key: 'email',    label: 'Email address',    type: 'email',    placeholder: 'you@example.com',  delay: '0.24s' },
    { key: 'password', label: 'Password',         type: 'password', placeholder: '••••••••',         delay: '0.30s' },
  ];

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

        .auth-gem-bg {
          position: absolute;
          inset: 0;
          opacity: 0.07;
          background-image:
            repeating-linear-gradient(60deg, rgba(212,180,90,0.6) 0px, rgba(212,180,90,0.6) 0.5px, transparent 0.5px, transparent 60px),
            repeating-linear-gradient(-60deg, rgba(212,180,90,0.6) 0px, rgba(212,180,90,0.6) 0.5px, transparent 0.5px, transparent 60px),
            repeating-linear-gradient(0deg, rgba(212,180,90,0.3) 0px, rgba(212,180,90,0.3) 0.5px, transparent 0.5px, transparent 60px);
        }

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

        .auth-left-content { position: relative; z-index: 2; }

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

        /* ── Steps indicator (decorative) ── */
        .auth-steps {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
        }

        .auth-step-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #e0d8cc;
        }

        .auth-step-dot.active { background: #b8922a; width: 20px; border-radius: 3px; }

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
          margin: 0 0 32px;
          animation: authSlideUp 0.65s 0.14s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* ── Fields ── */
        .auth-field {
          margin-bottom: 20px;
          animation: authSlideUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-label {
          display: block;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6b5e4a;
          margin-bottom: 8px;
        }

        .auth-input-wrap { position: relative; }

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

        /* Password strength bar */
        .auth-strength {
          margin-top: 6px;
          height: 2px;
          background: #ede7dc;
          border-radius: 2px;
          overflow: hidden;
        }

        .auth-strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.4s ease, background 0.4s ease;
        }

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
          animation: authSlideUp 0.65s 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-btn:not(:disabled):hover {
          background: #2c2418;
          transform: translateY(-1px);
        }

        .auth-btn:not(:disabled):active { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -80px; bottom: 0; width: 60px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent);
          transform: skewX(-15deg);
        }

        .auth-btn:not(:disabled):hover::after {
          animation: authBtnShimmer 0.55s ease forwards;
        }

        @keyframes authBtnShimmer { to { left: 110%; } }

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

        .auth-terms {
          font-size: 12px;
          color: #a09080;
          text-align: center;
          margin-top: 14px;
          line-height: 1.6;
          animation: authSlideUp 0.65s 0.40s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-terms a { color: #b8922a; text-decoration: none; font-weight: 500; }
        .auth-terms a:hover { color: #8a6a1a; }

        .auth-footer {
          margin-top: 24px;
          font-size: 13px;
          color: #9a8e7e;
          text-align: center;
          animation: authSlideUp 0.65s 0.44s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-footer a {
          color: #b8922a;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .auth-footer a:hover { color: #8a6a1a; }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          animation: authSlideUp 0.65s 0.38s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-divider-line { flex: 1; height: 0.5px; background: #e0d8cc; }
        .auth-divider-text { font-size: 11px; color: #b0a494; letter-spacing: 0.08em; }
      `}</style>

      <div className="auth-root">
        {/* ── Left panel ── */}
        <div className="auth-left">
          <div className="auth-gem-bg" />
          <div className="auth-glow" />

          <div className="auth-gem-svg">
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
              {/* Cushion-cut gem for signup variety */}
              <rect x="24" y="24" width="172" height="172" rx="36"
                fill="rgba(212,180,90,0.06)" stroke="rgba(212,180,90,0.25)" strokeWidth="0.8" />
              <polygon points="110,24 196,24 196,110"
                fill="rgba(240,225,180,0.08)" stroke="rgba(212,180,90,0.16)" strokeWidth="0.5" />
              <polygon points="110,24 24,24 24,110"
                fill="rgba(200,170,80,0.06)" stroke="rgba(212,180,90,0.14)" strokeWidth="0.5" />
              <polygon points="110,196 196,196 196,110"
                fill="rgba(160,130,60,0.08)" stroke="rgba(212,180,90,0.14)" strokeWidth="0.5" />
              <polygon points="110,196 24,196 24,110"
                fill="rgba(180,150,70,0.07)" stroke="rgba(212,180,90,0.12)" strokeWidth="0.5" />
              <rect x="52" y="52" width="116" height="116" rx="20"
                fill="none" stroke="rgba(212,180,90,0.14)" strokeWidth="0.5" />
              <ellipse cx="88" cy="46" rx="10" ry="5" fill="rgba(255,248,210,0.42)" transform="rotate(-14 88 46)" />
              <circle cx="110" cy="110" r="3" fill="rgba(255,240,180,0.3)" />
            </svg>
          </div>

          <div className="auth-left-content">
            <div className="auth-brand">Alpha Imports</div>
            <div className="auth-left-rule" />
            <h2 className="auth-left-headline">
              Begin your<br />collection today.
            </h2>
            <p className="auth-left-sub">
              Join a discerning circle of collectors with access to GIA-certified diamonds, exclusive inventory, and expert guidance.
            </p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="auth-right">
          <div className="auth-form-shell">
            <span className="auth-mobile-brand">Alpha Imports</span>

            <h1 className="auth-heading">Create account</h1>
            <p className="auth-subheading">Join Alpha Imports — it only takes a moment</p>

            {/* Decorative step dots */}
            <div className="auth-steps">
              <div className="auth-step-dot active" />
              <div className="auth-step-dot" />
              <div className="auth-step-dot" />
            </div>

            <form onSubmit={handleSubmit}>
              {fields.map(({ key, label, type, placeholder, delay }) => (
                <div className="auth-field" key={key} style={{ animationDelay: delay }}>
                  <label className="auth-label">{label}</label>
                  <div className="auth-input-wrap">
                    <input
                      type={type}
                      className="auth-input"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      required
                      minLength={key === 'password' ? 6 : undefined}
                    />
                    <div className="auth-input-bar" />
                  </div>

                  {/* Live password strength */}
                  {key === 'password' && form.password.length > 0 && (
                    <div className="auth-strength">
                      <div
                        className="auth-strength-fill"
                        style={{
                          width: `${Math.min(100, (form.password.length / 12) * 100)}%`,
                          background: form.password.length < 6
                            ? '#c0392b'
                            : form.password.length < 10
                              ? '#d4a520'
                              : '#4a9b6a',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" disabled={loading} className="auth-btn">
                {loading && <span className="auth-spinner" />}
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="auth-terms">
              By continuing you agree to our{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">Have an account?</span>
              <div className="auth-divider-line" />
            </div>

            <div className="auth-footer">
              <Link href="/login">Sign in instead</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
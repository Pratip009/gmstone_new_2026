'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MegaMenu from '@/components/ui/MegaMenu';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/');
  };

  const navLinkStyle = {
    color: 'var(--text-secondary)',
    letterSpacing: '0.15em',
    fontSize: '0.7rem',
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        {/* Announcement bar */}
        <div
          className="text-center py-1.5 hidden sm:block"
          style={{
            background: 'var(--text)',
            color: 'var(--bg)',
            letterSpacing: '0.2em',
            fontSize: '0.55rem',
            fontFamily: 'Josefin Sans, sans-serif',
            fontWeight: 500,
          }}
        >
          FREE SHIPPING ON ORDERS OVER $500 · CERTIFIED DIAMONDS
        </div>

        {/* Main nav bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-xl sm:text-2xl transition-opacity hover:opacity-70 shrink-0"
            style={{ color: 'var(--text)', letterSpacing: '0.05em' }}
            onClick={() => setMenuOpen(false)}
          >
            ◆ Alpha Imports
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">

            {/* ── MegaMenu replaces plain Collection link ── */}
            <MegaMenu />

            {user ? (
              <>
                <Link href="/cart" className="uppercase tracking-widest transition-opacity hover:opacity-60" style={navLinkStyle}>
                  Cart
                </Link>
                <Link href="/orders" className="uppercase tracking-widest transition-opacity hover:opacity-60" style={navLinkStyle}>
                  Orders
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="uppercase tracking-widest transition-opacity hover:opacity-60"
                    style={{ color: 'var(--gold)', letterSpacing: '0.15em', fontSize: '0.7rem' }}
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-4 pl-6" style={{ borderLeft: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="uppercase tracking-widest transition-opacity hover:opacity-60"
                    style={{ color: 'var(--muted)', letterSpacing: '0.15em', fontSize: '0.7rem' }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="uppercase tracking-widest transition-opacity hover:opacity-60" style={navLinkStyle}>
                  Login
                </Link>
                <Link href="/signup" className="btn-primary px-5 py-2 text-xs">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: right side icons */}
          <div className="flex md:hidden items-center gap-4">
            {user && (
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="text-sm transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-secondary)' }}
              >
                🛒
              </Link>
            )}
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 transition-opacity hover:opacity-60"
              aria-label="Toggle menu"
            >
              <span className="block h-px w-6 transition-all duration-300 origin-center"
                style={{ background: 'var(--text)', transform: menuOpen ? 'translateY(4px) rotate(45deg)' : 'none' }} />
              <span className="block h-px w-6 transition-all duration-300"
                style={{ background: 'var(--text)', opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'scaleX(1)' }} />
              <span className="block h-px w-6 transition-all duration-300 origin-center"
                style={{ background: 'var(--text)', transform: menuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-300"
        style={{
          background: 'var(--surface)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          top: '56px',
        }}
      >
        <div className="flex flex-col h-full px-6 py-10 gap-1">
          <div className="gold-divider mb-10" style={{ marginLeft: 0, background: 'linear-gradient(90deg, var(--gold), transparent)' }} />

          <MobileLink href="/products" onClick={() => setMenuOpen(false)}>Collection</MobileLink>

          {user ? (
            <>
              <MobileLink href="/cart" onClick={() => setMenuOpen(false)}>Cart</MobileLink>
              <MobileLink href="/orders" onClick={() => setMenuOpen(false)}>Orders</MobileLink>
              {isAdmin && (
                <MobileLink href="/admin" onClick={() => setMenuOpen(false)} gold>Admin</MobileLink>
              )}
              <div className="my-6" style={{ borderTop: '1px solid var(--border)' }} />
              <div className="mb-4">
                <p style={{ color: 'var(--muted)', fontSize: '0.65rem', letterSpacing: '0.15em' }} className="uppercase mb-1">Signed in as</p>
                <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Cormorant Garamond, serif' }}>{user.name}</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="uppercase tracking-widest text-left transition-opacity hover:opacity-60 mt-2"
                style={{ color: 'var(--danger)', letterSpacing: '0.15em', fontSize: '0.7rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="my-6" style={{ borderTop: '1px solid var(--border)' }} />
              <MobileLink href="/login" onClick={() => setMenuOpen(false)}>Login</MobileLink>
              <div className="mt-6">
                <Link href="/signup" className="btn-primary w-full text-center" onClick={() => setMenuOpen(false)}>
                  Create Account
                </Link>
              </div>
            </>
          )}

          <div className="mt-auto pb-8">
            <div className="gold-divider mb-6" style={{ marginLeft: 0, background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
            <p style={{ color: 'var(--muted)', fontSize: '0.6rem', letterSpacing: '0.2em' }} className="uppercase">
              Fine Diamonds & Gemstones
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileLink({ href, onClick, children, gold }: {
  href: string; onClick: () => void; children: React.ReactNode; gold?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="py-4 uppercase tracking-widest transition-opacity hover:opacity-60 flex items-center gap-3"
      style={{
        color: gold ? 'var(--gold)' : 'var(--text)',
        letterSpacing: '0.2em',
        fontSize: '0.8rem',
        borderBottom: '1px solid var(--border)',
        fontFamily: 'Josefin Sans, sans-serif',
        fontWeight: 500,
      }}
    >
      {gold && <span style={{ color: 'var(--gold)' }}>◆</span>}
      {children}
    </Link>
  );
}
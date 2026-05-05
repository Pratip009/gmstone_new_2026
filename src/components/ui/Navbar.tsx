'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import MegaMenu from '@/components/ui/MegaMenu';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
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
            <MegaMenu />

            {user ? (
              <>
                <Link href="/cart" className="transition-opacity hover:opacity-60" style={navLinkStyle}>
                  Cart
                </Link>
                <Link href="/orders" className="transition-opacity hover:opacity-60" style={navLinkStyle}>
                  Orders
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="transition-opacity hover:opacity-60"
                    style={{ color: 'var(--gold)', letterSpacing: '0.15em', fontSize: '0.7rem' }}
                  >
                    Admin
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div
                  ref={profileRef}
                  className="relative pl-6"
                  style={{ borderLeft: '1px solid var(--border)' }}
                >
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', letterSpacing: '0.15em' }}
                  >
                    {/* Avatar circle */}
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0"
                      style={{
                        background: 'var(--gold)',
                        color: 'var(--bg)',
                        fontFamily: 'Josefin Sans, sans-serif',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text)', letterSpacing: '0.12em' }}>{user.name}</span>
                    {/* Chevron */}
                    <svg
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                      style={{
                        color: 'var(--muted)',
                        transition: 'transform 0.2s ease',
                        transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Dropdown Panel */}
                  <div
                    className="absolute right-0 mt-3 w-52"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                      opacity: profileOpen ? 1 : 0,
                      pointerEvents: profileOpen ? 'auto' : 'none',
                      transform: profileOpen ? 'translateY(0)' : 'translateY(-6px)',
                      transition: 'opacity 0.18s ease, transform 0.18s ease',
                      zIndex: 100,
                    }}
                  >
                    {/* User info header */}
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <p style={{ color: 'var(--muted)', fontSize: '0.6rem', letterSpacing: '0.18em', fontFamily: 'Josefin Sans, sans-serif' }} className="uppercase mb-0.5">
                        Signed in as
                      </p>
                      <p style={{ color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'Cormorant Garamond, serif' }}>
                        {user.name}
                      </p>
                      <p style={{ color: 'var(--muted)', fontSize: '0.68rem' }}>{user.email}</p>
                    </div>

                    {/* Dropdown links */}
                    <div className="py-1">
                      <DropdownItem href="/orders" onClick={() => setProfileOpen(false)}>
                        My Orders
                      </DropdownItem>
                      <DropdownItem href="/account" onClick={() => setProfileOpen(false)}>
                        Account Settings
                      </DropdownItem>
                    </div>

                    {/* Logout */}
                    <div style={{ borderTop: '1px solid var(--border)' }} className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 uppercase tracking-widest transition-opacity hover:opacity-60 flex items-center gap-2"
                        style={{ color: 'var(--danger)', fontSize: '0.65rem', letterSpacing: '0.18em', fontFamily: 'Josefin Sans, sans-serif' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M4.5 6H10.5M10.5 6L8.5 4M10.5 6L8.5 8M7 2H2.5C2.22 2 2 2.22 2 2.5V9.5C2 9.78 2.22 10 2.5 10H7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
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

// Dropdown menu item
function DropdownItem({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2.5 uppercase tracking-widest transition-opacity hover:opacity-60"
      style={{ color: 'var(--text-secondary)', fontSize: '0.65rem', letterSpacing: '0.18em', fontFamily: 'Josefin Sans, sans-serif' }}
    >
      {children}
    </Link>
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
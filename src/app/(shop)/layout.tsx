import Navbar from '@/components/ui/Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <footer className="mt-24 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col items-center gap-4">
            <p className="font-serif text-2xl" style={{ color: 'var(--text)' }}>
              💎 Alpha Imports
            </p>
            <div className="gold-divider w-16" />
            <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted)', letterSpacing: '0.2em' }}>
              Fine Diamonds & Gemstones
            </p>
            <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>
              © {new Date().getFullYear()} GemStone. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

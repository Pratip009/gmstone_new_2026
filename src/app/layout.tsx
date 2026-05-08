// app/layout.tsx
import type { Metadata } from "next";
import Providers from "./providers";
import "./global.css";
import StartupLoader from "./StartupLoader";

export const metadata: Metadata = {
  title: "Alpha Imports — Fine Diamonds & Gemstones",
  description: "Curated collection of premium diamonds and gemstones",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ background: "var(--bg)", color: "var(--text)" }}>
        <Providers>
          <StartupLoader>{children}</StartupLoader>
        </Providers>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import Providers from "./providers";
import StartupLoader from "./StartupLoader";
import "./global.css";
import FloatingSocialIcons from "@/components/ui/FloatingSocialIcons";

export const metadata: Metadata = {
  metadataBase: new URL("https://alphaimports.com"),

  title: {
    default: "Alpha Imports | Fine Diamonds, Gemstones & Jewelry",
    template: "%s | Alpha Imports",
  },

  description:
    "Discover premium diamonds, colored gemstones, sapphires, rubies, emeralds, and fine jewelry from Alpha Imports.",

  keywords: [
    "diamonds",
    "gemstones",
    "fine jewelry",
    "natural diamonds",
    "certified diamonds",
    "sapphires",
    "rubies",
    "emeralds",
    "Alpha Imports",
  ],

  creator: "Alpha Imports",
  publisher: "Alpha Imports",

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://alphaimports.com",
  },

  openGraph: {
    type: "website",
    url: "https://alphaimports.com",
    siteName: "Alpha Imports",
    title: "Alpha Imports | Fine Diamonds, Gemstones & Jewelry",
    description:
      "Premium diamonds, gemstones, and luxury jewelry collections.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Alpha Imports",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Alpha Imports | Fine Diamonds, Gemstones & Jewelry",
    description:
      "Premium diamonds, gemstones, and luxury jewelry collections.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "JewelryStore",
              name: "Alpha Imports",
              url: "https://alphaimports.com",
              description:
                "Premium diamonds, gemstones and fine jewelry.",
            }),
          }}
        />
      </head>

      <body
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          position: "relative",
        }}
      >
        <Providers>
          <StartupLoader>
            {children}
            <FloatingSocialIcons />
          </StartupLoader>
        </Providers>
      </body>
    </html>
  );
}
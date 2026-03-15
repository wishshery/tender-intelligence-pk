import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "TenderIQ Pakistan – Government Procurement Intelligence",
  description:
    "AI-powered government tender intelligence platform for Pakistani SMEs. Discover, analyse, and win PPRA procurement opportunities.",
  keywords: "Pakistan tenders, PPRA, government procurement, SME, procurement intelligence",
  openGraph: {
    title: "TenderIQ Pakistan",
    description: "AI-powered Government Procurement Intelligence for Pakistani SMEs",
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </Providers>
      </body>
    </html>
  );
}

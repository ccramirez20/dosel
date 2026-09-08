import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dosel café y método",
    template: "%s · Dosel",
  },
  description:
    "Café de origen colombiano, métodos de preparación y talleres, contados por un biólogo. Cada taza viene de un lugar concreto y aquí te decimos cuál.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Dosel café y método",
    title: "Dosel café y método",
    description:
      "Café de origen colombiano, métodos de preparación y talleres, contados por un biólogo.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CO"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:text-cream"
        >
          Saltar al contenido
        </a>
        <Nav />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

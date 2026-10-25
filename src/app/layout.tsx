import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ALUCRA GENÇFEST 2026 | Alucra Kalkınma ve Eğitim Vakfı Gençlik Kolları",
  description: "Alucra GençFest — 31 Ekim 2026, Haliç Event House. Ücretsiz kayıt ol, QR biletini anında al.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={jakarta.variable}>
      <body>
        {/* Sayfanın arkasındaki hafif altın/mavi ışık lekeleri ve noktalı ızgara */}
        <div className="ambient" aria-hidden="true">
          <span className="ambient-top" />
          <span className="ambient-left" />
          <span className="ambient-right" />
          <span className="ambient-bottom" />
          <span className="ambient-grid" />
        </div>
        {/* Sayfanın ne kadar kaydırıldığını gösteren ince altın çizgi */}
        <div className="scroll-progress" aria-hidden="true" />
        {children}
        <RevealOnScroll />
      </body>
    </html>
  );
}

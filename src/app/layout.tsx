import type { Metadata, Viewport } from "next";
import { DotGothic16, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/layout/PwaRegister";
import { HydrateGate } from "@/components/layout/HydrateGate";

const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dotgothic",
  display: "swap",
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

export const metadata: Metadata = {
  title: "人生クエスト",
  description: "日々の行動が経験値になる、レトロRPG風ライフログPWA",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "人生クエスト",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${dotGothic.variable} ${pressStart.variable} h-full`}>
      <body className="h-full bg-rpg-bg text-rpg-text antialiased">
        <PwaRegister />
        <HydrateGate>{children}</HydrateGate>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import ChatBot from "@/components/ChatBot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Props.ai | AI Real Estate Intelligence & Price Benchmark",
  description: "Instant property valuation, Ready Reckoner circle rates, MRDA sanctions, and Guntha plot rates across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen selection:bg-emerald-500 selection:text-white`}>
        <Navbar />
        <main className="min-h-screen w-full relative pb-20 md:pb-0">
          {children}
        </main>
        <MobileBottomNav />
        <ChatBot />
      </body>
    </html>
  );
}

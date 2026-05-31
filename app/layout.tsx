import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Hot Spots: Draconis Reach — Campaign Manager",
  description: "Track your Battletech Chaos Campaign: Mercenaries campaign",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VercelToolbar } from "@vercel/toolbar/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "مجموعة العزب - The Alazab Group",
  description: "AI-powered customer service bot for Alazab Construction, Luxury Finishing, Brand Identity, UberFix, and Laban Alasfour. Available on Web, WhatsApp, and Telegram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <VercelToolbar />
      </body>
    </html>
  );
}

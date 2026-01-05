import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MVP Usluge - Platforma za oglašavanje",
  description: "Povežite se sa pružaocima usluga",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
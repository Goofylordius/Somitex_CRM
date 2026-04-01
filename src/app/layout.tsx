import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";

import "@/app/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Somitex CRM Secure",
  description: "Sicheres CRM auf Next.js und Supabase mit DSGVO- und Audit-Fokus."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${manrope.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}


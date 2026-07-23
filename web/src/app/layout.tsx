import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Micro-LMS",
  description: "A decoupled micro learning platform — Trinity Architecture demo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SiteNav />
        <main className="py-10">{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const firaCode = Fira_Code({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Micro-LMS — learn full-stack, the right way",
    template: "%s · Micro-LMS",
  },
  description:
    "A decoupled micro learning platform — static Next.js frontend, hardened Node.js API, signature-verified payments. Built on the Trinity Architecture.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <SiteNav />
          <main className="pt-28 sm:pt-32">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}

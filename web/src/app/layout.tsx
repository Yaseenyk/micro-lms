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
    default: "Pith — get to the core of AI",
    template: "%s · Pith",
  },
  description:
    "Text-first AI courses — RAG, agents, prompt engineering, and more. Detailed writing and clear diagrams you read at your own pace. No video.",
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

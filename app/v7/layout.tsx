import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import "./v7.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-v7-inter" });

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  openGraph: { title: `${SITE_NAME} — ${SITE_TAGLINE}` },
  twitter: { card: "summary_large_image" },
};

export default function V7Layout({ children }: { children: React.ReactNode }) {
  return <div data-site="v7" className={inter.variable}>{children}</div>;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DCM Surgical Recommender | Ascension Seton",
  description: "Prototype tool to support surgical planning in cervical myelopathy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

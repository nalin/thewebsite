import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Website",
  description: "A self-evolving, community-driven website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

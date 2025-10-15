import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning",
  description: "For Learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="root">{children}</body>
    </html>
  );
}

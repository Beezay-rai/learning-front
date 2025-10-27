import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/providers/reduxProvider";

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
      <body className="root">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}

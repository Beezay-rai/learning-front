import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import CommonProvider from "@/providers/CommonProvider";
export const metadata: Metadata = {
  title: "TEE HEE",
  description: "Tee hee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="root">
        <CommonProvider>
          <ReduxProvider>{children}</ReduxProvider>
        </CommonProvider>
      </body>
    </html>
  );
}

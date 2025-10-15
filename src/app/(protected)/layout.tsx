import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Sidebar } from "lucide-react";
import { SideBar } from "@/app/(protected)/components/sidebar";
import AuthProvider from "@/providers/authProvider";
import { Provider } from "react-redux";
import { persistor, store } from "@/common/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { ReduxProvider } from "@/providers/reduxProvider";
import Breadcrumbs from "./components/breadcrumb";
import MyQueryClientProvider from "@/providers/queryClientProvider";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learning protected",
  description: "For Learning Purpose",
};

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MyQueryClientProvider>
      <ReduxProvider>
        <AuthProvider>
          <div className="flex h-screen ">
            <SideBar />
            <main className="flex-1 overflow-auto transition-all duration-300 ml-0">
              <div className="p-6">
                <Breadcrumbs />
                {children}
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  pauseOnHover
                  limit={1}
                />
              </div>
            </main>
          </div>
        </AuthProvider>
      </ReduxProvider>
    </MyQueryClientProvider>
  );
}

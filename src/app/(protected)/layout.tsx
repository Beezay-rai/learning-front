import { SideBar } from "@/app/(protected)/components/layout/sidebar";
import Breadcrumbs from "./components/layout/breadcrumb";
import MyQueryClientProvider from "@/providers/MyQueryClientProvider";
import { ToastContainer } from "react-toastify";
import AuthProvider from "@/providers/AuthProvider";
import NetworkLogPanel from "./components/network-log-panel";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <MyQueryClientProvider>
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
        {/* <NetworkLogPanel /> */}
      </MyQueryClientProvider>
    </AuthProvider>
  );
}

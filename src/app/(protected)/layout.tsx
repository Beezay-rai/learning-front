import AuthProvider from "@/providers/AuthProvider";
import MyQueryClientProvider from "@/providers/MyQueryClientProvider";
import { ToastContainer } from "react-toastify";
import Breadcrumbs from "./components/layout/breadcrumb";
import { Sidebar } from "./components/layout/SideBar";
import { TopBar } from "./components/layout/topbar";
import NetworkLogPanel from "./components/NetworkLogPanel";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <MyQueryClientProvider>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-auto transition-all duration-300">
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
        </div>
        {/* <NetworkLogPanel /> */}
      </MyQueryClientProvider>
    </AuthProvider>
  );
}

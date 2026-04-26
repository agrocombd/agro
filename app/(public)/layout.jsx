import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";

export default function PublicLayout({ children }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
      </div>
    </ToastProvider>
  );
}

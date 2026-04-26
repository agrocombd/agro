import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function VendorLayout({ children }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,avatar_url,role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "retail_vendor" && profile?.role !== "b2b_vendor" && profile?.role !== "admin" && profile?.role !== "manager") {
    redirect("/dashboard");
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex">
          <DashboardSidebar profile={profile} />
          <main className="flex-1 min-w-0 p-4 lg:p-6">
            {children}
          </main>
        </div>
        <Footer />
        <BottomNav />
      </div>
    </ToastProvider>
  );
}

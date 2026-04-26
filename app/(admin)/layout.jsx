import { createServerSupabaseClient } from "@/lib/supabase-server";
export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/Toast";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function AdminLayout({ children }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,avatar_url,role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "manager") {
    redirect("/dashboard");
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 flex">
          <DashboardSidebar profile={profile} />
          <main className="flex-1 min-w-0 p-4 lg:p-6 bg-slate-50 dark:bg-slate-900">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

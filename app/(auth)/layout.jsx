import Image from "next/image";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex">
        {/* Left panel — decorative (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }} />
          <Link href="/" className="relative z-10">
            <Image src="/logo.png" alt="Agro.com.bd" width={140} height={48} className="brightness-0 invert" />
          </Link>
          <div className="relative z-10 mt-auto">
            <h2 className="text-3xl font-extrabold text-white leading-snug">
              বাংলাদেশের সেরা কৃষি মার্কেটপ্লেস
            </h2>
            <p className="mt-3 text-green-100 text-sm leading-relaxed">
              তাজা শাকসবজি, ফলমূল, বীজ, সার ও কৃষি যন্ত্রপাতি — সরাসরি কৃষকদের কাছ থেকে।
            </p>
            <div className="mt-6 flex gap-4 text-sm text-green-100">
              <span>✓ ১০,০০০+ পণ্য</span>
              <span>✓ বিশ্বস্ত বিক্রেতা</span>
              <span>✓ দ্রুত ডেলিভারি</span>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between p-4 lg:p-6">
            <Link href="/" className="lg:hidden">
              <Image src="/logo.png" alt="Agro.com.bd" width={100} height={34} />
            </Link>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 pb-6">
            © ২০২৪ Agro.com.bd •{" "}
            <Link href="/privacy" className="hover:text-green-600">গোপনীয়তা নীতি</Link>
          </p>
        </div>
      </div>
    </ToastProvider>
  );
}

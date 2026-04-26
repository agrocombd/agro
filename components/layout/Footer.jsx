import Link from "next/link";
import Image from "next/image";

const SHOP_LINKS = [
  { label: "শপ", href: "/shop" },
  { label: "পাইকারি", href: "/b2b" },
  { label: "বিক্রেতা হোন", href: "/signup/vendor" },
  { label: "অ্যাফিলিয়েট", href: "/signup" },
];
const INFO_LINKS = [
  { label: "আমাদের সম্পর্কে", href: "/about" },
  { label: "যোগাযোগ", href: "/contact" },
  { label: "ব্লগ", href: "/blog" },
  { label: "সচরাচর প্রশ্ন", href: "/faq" },
];
const LEGAL_LINKS = [
  { label: "গোপনীয়তা নীতি", href: "/privacy" },
  { label: "শর্তাবলী", href: "/terms" },
  { label: "ফেরত নীতি", href: "/return-refund" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto">
      {/* Main footer */}
      <div className="container-app py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="agro.com.bd" width={130} height={36} className="h-9 w-auto brightness-0 invert opacity-90" />
            </Link>
            <p className="text-xs leading-relaxed text-slate-500 mb-4">
              বাংলাদেশের সেরা অনলাইন কৃষি মার্কেটপ্লেস। কৃষক থেকে সরাসরি ক্রেতার কাছে।
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { icon: "f", href: "#", label: "Facebook" },
                { icon: "▶", href: "#", label: "YouTube" },
                { icon: "✉", href: "#", label: "Email" },
              ].map(({ icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-green-600 text-slate-400 hover:text-white text-xs transition-colors">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-300">শপ</p>
            <ul className="space-y-2">
              {SHOP_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-xs hover:text-green-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-300">তথ্য</p>
            <ul className="space-y-2">
              {INFO_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-xs hover:text-green-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment + App */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-300">পেমেন্ট</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {["বিকাশ", "নগদ", "COD"].map(p => (
                <span key={p} className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-300">{p}</span>
              ))}
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-300">ডেলিভারি</p>
            <div className="flex flex-wrap gap-2">
              {["Steadfast", "RedX", "Pathao"].map(c => (
                <span key={c} className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-300">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
          <p className="text-[11px] text-slate-600">
            © {year} agro.com.bd — সর্বস্বত্ব সংরক্ষিত
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="text-[11px] hover:text-green-400 transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

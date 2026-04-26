import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-hind",
  display: "swap",
  weight: ["400", "600", "700"],
  preload: true,
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://agro.com.bd"),
  title: {
    default: "agro.com.bd — বাংলাদেশের সেরা কৃষি মার্কেটপ্লেস",
    template: "%s | agro.com.bd",
  },
  description: "বাংলাদেশের সেরা অনলাইন কৃষি মার্কেটপ্লেস। তাজা সবজি, ফলমূল, বীজ, সার, কৃষি যন্ত্রপাতি কিনুন।",
  keywords: ["কৃষি", "agriculture", "bangladesh", "agro", "farming", "vegetable", "seed", "fertilizer"],
  authors: [{ name: "agro.com.bd" }],
  creator: "agro.com.bd",
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: "en_US",
    url: "https://agro.com.bd",
    siteName: "agro.com.bd",
    title: "agro.com.bd — বাংলাদেশের সেরা কৃষি মার্কেটপ্লেস",
    description: "বাংলাদেশের সেরা অনলাইন কৃষি মার্কেটপ্লেস",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "agro.com.bd" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "agro.com.bd",
    description: "বাংলাদেশের সেরা কৃষি মার্কেটপ্লেস",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#16a34a" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#052e16" media="(prefers-color-scheme: dark)" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} ${hindSiliguri.variable} font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

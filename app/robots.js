export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/b2b", "/forum", "/ai-assistant", "/about", "/contact", "/faq"],
        disallow: ["/admin/", "/vendor/", "/dashboard/", "/api/", "/auth/", "/checkout"],
      },
      // Allow AI bots to crawl content
      {
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "CCBot", "anthropic-ai", "Claude-Web"],
        allow: ["/", "/shop", "/b2b", "/forum"],
        disallow: ["/admin/", "/vendor/", "/dashboard/", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://agro.com.bd/sitemap.xml",
  };
}

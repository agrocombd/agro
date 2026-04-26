// ── String helpers ─────────────────────────────────────────
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str, n = 100) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n).trim() + "…" : str;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ── Number helpers ─────────────────────────────────────────
export function formatPrice(amount, currency = "৳") {
  if (amount === null || amount === undefined) return `${currency}0`;
  return `${currency}${Number(amount).toLocaleString("en-BD")}`;
}

export function formatNumber(n) {
  return Number(n || 0).toLocaleString("en-BD");
}

// ── Date helpers ───────────────────────────────────────────
export function formatDate(date, locale = "bn-BD") {
  if (!date) return "";
  return new Date(date).toLocaleDateString(locale, {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    [31536000, "বছর"],
    [2592000,  "মাস"],
    [86400,    "দিন"],
    [3600,     "ঘন্টা"],
    [60,       "মিনিট"],
  ];
  for (const [secs, label] of intervals) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n} ${label} আগে`;
  }
  return "এইমাত্র";
}

// ── Phone helpers (BD) ─────────────────────────────────────
export function normalizePhone(phone) {
  if (!phone) return "";
  let p = phone.replace(/\s+/g, "");
  if (p.startsWith("+880")) p = "0" + p.slice(4);
  else if (p.startsWith("880")) p = "0" + p.slice(3);
  return p;
}

export function isValidBDPhone(phone) {
  const p = normalizePhone(phone);
  return /^01[3-9]\d{8}$/.test(p);
}

// ── Image helpers ──────────────────────────────────────────
export function getProductImage(images, fallback = null) {
  if (Array.isArray(images) && images.length > 0 && images[0]) return images[0];
  return fallback || "/placeholder-product.png";
}

// ── Perishable check ───────────────────────────────────────
const PERISHABLE_SLUGS = new Set([
  "vegetables", "fruits", "fish", "poultry", "livestock",
]);

export function isPerishableCategory(categorySlug) {
  return PERISHABLE_SLUGS.has(categorySlug);
}

// ── Zero-pad number for assistant display ─────────────────
export function padAssistantNumber(n) {
  return String(n).padStart(3, "0");
}

// ── Hash (for AI cache keys) ───────────────────────────────
export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Normalize query for AI cache ───────────────────────────
export function normalizeQuery(text) {
  const stopWords = new Set([
    "আমি","আমার","এই","ওই","কি","কী","কেন","কীভাবে","কিভাবে","কখন",
    "the","a","an","is","are","my","i","we","our","what","why","how","when",
  ]);
  return text
    .toLowerCase()
    .replace(/[?,।!;:""'']/g, "")
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w))
    .sort()
    .join(" ")
    .trim();
}

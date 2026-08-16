const VOUCHER_PLACEHOLDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e6f4ef"/>
      <stop offset="100%" stop-color="#c9e8dd"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00694c"/>
      <stop offset="100%" stop-color="#008560"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" rx="32" fill="url(#bg)"/>
  <circle cx="640" cy="110" r="120" fill="#ffffff" fill-opacity="0.45"/>
  <circle cx="120" cy="420" r="140" fill="#ffffff" fill-opacity="0.35"/>
  <rect x="64" y="64" width="672" height="372" rx="28" fill="#ffffff" fill-opacity="0.72"/>
  <rect x="100" y="108" width="180" height="180" rx="24" fill="url(#accent)"/>
  <path d="M140 164h100v20H140zm0 40h80v20h-80zm0 40h120v20H140z" fill="#fff" fill-opacity="0.95"/>
  <circle cx="208" cy="154" r="18" fill="#fff" fill-opacity="0.95"/>
  <text x="330" y="170" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">Voucher Preview</text>
  <text x="330" y="215" fill="#475569" font-family="Arial, Helvetica, sans-serif" font-size="18">Hình ảnh đang tải hoặc không khả dụng</text>
  <rect x="330" y="260" width="270" height="18" rx="9" fill="#d1fae5"/>
  <rect x="330" y="294" width="220" height="18" rx="9" fill="#d1fae5"/>
  <rect x="330" y="328" width="300" height="18" rx="9" fill="#d1fae5"/>
</svg>`;

export const DEFAULT_VOUCHER_IMAGE =
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(VOUCHER_PLACEHOLDER_SVG.trim())}`;

export function normalizeImageUrl(url, { width = 1200, height = 800, quality = 90 } = {}) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("images.unsplash.com")) {
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", String(width));
      if (height) parsed.searchParams.set("h", String(height));
      parsed.searchParams.set("q", String(quality));
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}

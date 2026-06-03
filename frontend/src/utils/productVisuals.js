export const PRODUCT_IMAGES = {
  "Studio Desk Lamp": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
  "Modular Storage Box": "https://images.unsplash.com/photo-1588615419962-8e731b857a2f?auto=format&fit=crop&w=900&q=80",
  "Premium Notebook": "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?auto=format&fit=crop&w=900&q=80",
  "Cable Organizer": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80",
  "Standing Mat": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80",
  "Desk Shelf": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
  "Wireless Charger": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=900&q=80",
  "Travel Pouch": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
  "Monitor Arm": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
  "Focus Timer": "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=900&q=80",
};

export function getProductImage(product) {
  return PRODUCT_IMAGES[product?.name] || product?.image_url || getFallbackImage(product);
}

export function getFallbackImage(product) {
  const title = product?.name || "Ethara Product";
  const category = product?.category || "Inventory";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">
      <rect width="900" height="700" fill="#f4f7f6"/>
      <rect x="70" y="70" width="760" height="560" rx="32" fill="#ffffff" stroke="#ccfbf1" stroke-width="4"/>
      <circle cx="720" cy="170" r="70" fill="#ccfbf1"/>
      <rect x="160" y="205" width="420" height="34" rx="17" fill="#0f766e"/>
      <rect x="160" y="275" width="600" height="24" rx="12" fill="#d4d4d8"/>
      <rect x="160" y="330" width="500" height="24" rx="12" fill="#e4e4e7"/>
      <text x="160" y="470" fill="#18181b" font-family="Arial, sans-serif" font-size="48" font-weight="700">${escapeSvg(title)}</text>
      <text x="160" y="525" fill="#0f766e" font-family="Arial, sans-serif" font-size="28" font-weight="600">${escapeSvg(category)}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function handleProductImageError(event, product) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = getFallbackImage(product);
}

export function getStockMeta(product) {
  const stock = Number(product?.stock_quantity || 0);
  if (product?.status === "out_of_stock" || stock <= 0) {
    return { label: "Out of stock", tone: "danger", isOutOfStock: true };
  }
  if (stock <= Number(product?.low_stock_threshold || 0)) {
    return { label: `Only ${stock} left`, tone: "warn", isOutOfStock: false };
  }
  return { label: `${stock} available`, tone: "ok", isOutOfStock: false };
}

export function stockBadgeClass(tone) {
  if (tone === "danger") return "border-rose-200 bg-rose-50 text-rose-700";
  if (tone === "warn") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-teal-200 bg-teal-50 text-teal-700";
}

function escapeSvg(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

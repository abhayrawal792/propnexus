export type Property = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  listingType: "Sale" | "Rent";
  propertyType: "House" | "Apartment" | "Land" | "Commercial";
  status: "Available" | "Under Offer" | "Sold" | "Rented";
  location: string;
  city: string;
  areaSize: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  parkingSpaces: number;
  roadAccess: string;
  facingDirection: string;
  amenities: string[];
  imageUrls: string[];
  featuredImage: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
};

export function formatNpr(value: number, listingType?: Property["listingType"]) {
  const amount = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
  return listingType === "Rent" ? `Rs. ${amount} / mo.` : `Rs. ${amount}`;
}

export function propertyStatusClass(status: Property["status"]) {
  if (status === "Under Offer") return "bg-amber-100 text-amber-950";
  if (status === "Sold" || status === "Rented") return "bg-slate-900 text-white";
  return "bg-[#d7b16c] text-[#0c1c2e]";
}

export function sanitizePropertyImages(imageUrls: unknown, featuredImage: unknown): string[] {
  const isSafeImagePath = (value: unknown): value is string => typeof value === "string" && (value.startsWith("/manus-storage/") || /^https?:\/\//.test(value));
  const candidates = Array.isArray(imageUrls) ? imageUrls.filter(isSafeImagePath) : [];
  if (candidates.length) return candidates;
  return isSafeImagePath(featuredImage) ? [featuredImage] : [];
}

export function resolveGalleryState(imageUrls: unknown, featuredImage: unknown, activeIndex: number) {
  const images = sanitizePropertyImages(imageUrls, featuredImage);
  const index = Math.min(Math.max(activeIndex, 0), Math.max(images.length - 1, 0));
  return { images, activeIndex: index, image: images[index] ?? "", hasNavigation: images.length > 1 };
}

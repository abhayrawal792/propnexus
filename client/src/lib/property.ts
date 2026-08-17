export type PriceHistoryPoint = { date: string; price: number; verified?: boolean };

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
  ward: number;
  municipality: string;
  roadWidth: number;
  priceHistory?: PriceHistoryPoint[];
};

export function getVerifiedPriceHistory(property: Pick<Property, "price" | "createdAt" | "priceHistory">) {
  const points = (property.priceHistory ?? []).filter(point => point.verified !== false && Number.isFinite(point.price) && Boolean(point.date));
  return points.length ? points.sort((a, b) => a.date.localeCompare(b.date)) : [];
}

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

export type PropertySort = "newest" | "price-low" | "price-high" | "location" | "type";

export function sortProperties(properties: Property[], sort: PropertySort) {
  return [...properties].sort((left, right) => {
    if (sort === "price-low") return left.price - right.price;
    if (sort === "price-high") return right.price - left.price;
    if (sort === "location") return `${left.city} ${left.location}`.localeCompare(`${right.city} ${right.location}`);
    if (sort === "type") return left.propertyType.localeCompare(right.propertyType) || left.title.localeCompare(right.title);
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export function getComparisonDifferenceKeys(properties: Property[]) {
  const values = {
    price: properties.map(property => property.price),
    type: properties.map(property => property.propertyType),
    area: properties.map(property => property.areaSize),
    bedrooms: properties.map(property => property.bedrooms || 0),
    status: properties.map(property => property.status),
  };
  return new Set(Object.entries(values).filter(([, entries]) => new Set(entries.map(String)).size > 1).map(([key]) => key));
}

export function toggleComparisonId(ids: string[], propertyId: string, limit = 3) {
  if (ids.includes(propertyId)) return ids.filter(id => id !== propertyId);
  return ids.length < limit ? [...ids, propertyId] : ids;
}

export function getSimilarProperties(property: Property, allProperties: Property[], limit = 3) {
  return allProperties
    .filter(candidate => candidate.id !== property.id && candidate.published && candidate.status === "Available")
    .map(candidate => ({
      candidate,
      score: (candidate.propertyType === property.propertyType ? 5 : 0)
        + (candidate.city === property.city ? 3 : 0)
        + (candidate.listingType === property.listingType ? 2 : 0)
        - Math.min(Math.abs(candidate.price - property.price) / Math.max(property.price, 1), 1),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}


const NEPAL_LOCATION_COORDINATES: Array<[RegExp, { lat: number; lng: number }]> = [
  [/kathmandu|budhanilkantha|maharajgunj|kirtipur|bhaisepati|tokha/i, { lat: 27.7172, lng: 85.3240 }],
  [/chitwan|bharatpur/i, { lat: 27.5291, lng: 84.3542 }],
  [/pokhara/i, { lat: 28.2096, lng: 83.9856 }],
  [/lalitpur|patan/i, { lat: 27.6588, lng: 85.3247 }],
];

export function getPropertyCoordinates(property: Pick<Property, "location" | "city">) {
  const query = `${property.location} ${property.city}`;
  return NEPAL_LOCATION_COORDINATES.find(([pattern]) => pattern.test(query))?.[1] ?? { lat: 27.7172, lng: 85.3240 };
}

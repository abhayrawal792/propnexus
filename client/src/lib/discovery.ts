export const SAVED_SEARCHES_KEY = "propnexus_saved_searches";
export const COMPARISON_SHARE_PARAM = "compare";
export const GUIDED_SEARCH_EXAMPLES = [
  "A family house in Lalitpur under 3 crore",
  "A 16 ft road plot near Kathmandu",
  "A furnished apartment in Pokhara for rent",
] as const;

export type SavedSearchCriteria = {
  propertyType: "All" | "House" | "Apartment" | "Land" | "Commercial";
  listingType: "All" | "Sale" | "Rent";
  location: string;
  municipality: string;
  ward: string;
  roadWidth: string;
  price: string;
  sort: "newest" | "price-low" | "price-high" | "location" | "type";
  onlyFavorites: boolean;
};

export type SavedSearch = { id: string; label: string; criteria: SavedSearchCriteria };

export function parseSavedSearches(raw: string | null): SavedSearch[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function serializeSavedSearches(searches: SavedSearch[]) {
  return JSON.stringify(searches.slice(0, 8));
}

export function buildComparisonShareUrl(origin: string, ids: string[]) {
  const boundedIds = ids.filter(Boolean).slice(0, 3);
  return `${origin}/wishlist?${COMPARISON_SHARE_PARAM}=${encodeURIComponent(boundedIds.join(","))}&shared=1`;
}

export function parseComparisonIds(search: string) {
  const ids = new URLSearchParams(search).get(COMPARISON_SHARE_PARAM)?.split(",").filter(Boolean) ?? [];
  return ids.slice(0, 3);
}

import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  supabaseRest: vi.fn(),
  storagePut: vi.fn(),
  notifyOwner: vi.fn(),
  sendOwnerInquiryEmail: vi.fn(),
  sendComparisonPdfEmail: vi.fn(),
  invokeLLM: vi.fn(),
}));

vi.mock("./supabase", () => ({
  supabaseRest: mocks.supabaseRest,
  isSchemaUnavailable: () => false,
}));

vi.mock("./storage", () => ({
  storagePut: mocks.storagePut,
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: mocks.notifyOwner,
}));

vi.mock("./_core/email", () => ({
  sendOwnerInquiryEmail: mocks.sendOwnerInquiryEmail,
}));

vi.mock("./_core/comparisonEmail", () => ({
  sendComparisonPdfEmail: mocks.sendComparisonPdfEmail,
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: mocks.invokeLLM,
}));

import { appRouter } from "./routers";
import { getComparisonDifferenceKeys, getSimilarProperties, getVerifiedPriceHistory, resolveGalleryState, sanitizePropertyImages, sortProperties, type Property } from "../client/src/lib/property";
import { FAVORITES_STORAGE_KEY, parseFavoriteIds, readFavoriteIds, saveFavoriteIds } from "../client/src/hooks/useFavorites";
import { toggleComparisonId } from "../client/src/lib/property";
import { addQueryToHistory, buildComparisonShareUrl, GUIDED_SEARCH_EXAMPLES, parseComparisonIds, parseQueryHistory, parseSavedSearches, serializeQueryHistory, serializeSavedSearches, type SavedSearch } from "../client/src/lib/discovery";
import { applyFilters, MAX_NATURAL_SEARCH_RESULTS, parseNaturalLanguageFallback } from "./routers/properties";
import { syncRouter } from "./routers/sync";

const dbProperty = {
  id: "9a17b2d1-e5c6-4f22-b891-f5df00000001",
  title: "Test Kathmandu Residence",
  slug: "test-kathmandu-residence",
  description: "A detailed, testable property description for workflow coverage.",
  price: 32500000,
  listing_type: "Sale",
  property_type: "House",
  status: "Available",
  location: "Budhanilkantha",
  city: "Kathmandu",
  area_size: "4,100 sq. ft.",
  bedrooms: 5,
  bathrooms: 5,
  floors: 3,
  parking_spaces: 2,
  road_access: "18 ft paved road",
  facing_direction: "East",
  amenities: ["Water supply", "Security"],
  image_urls: ["/manus-storage/test-property.jpg"],
  featured_image: "/manus-storage/test-property.jpg",
  is_featured: true,
  is_published: true,
  created_at: "2026-08-16T00:00:00.000Z",
};

function context(role: "admin" | "user" = "admin"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "propnexus-owner",
      name: "Abhay",
      email: "owner@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as TrpcContext["res"],
  };
}

const propertyInput = {
  title: dbProperty.title,
  slug: dbProperty.slug,
  description: dbProperty.description,
  price: dbProperty.price,
  listingType: "Sale" as const,
  propertyType: "House" as const,
  status: "Available" as const,
  location: dbProperty.location,
  city: dbProperty.city,
  areaSize: dbProperty.area_size,
  bedrooms: dbProperty.bedrooms,
  bathrooms: dbProperty.bathrooms,
  floors: dbProperty.floors,
  parkingSpaces: dbProperty.parking_spaces,
  roadAccess: dbProperty.road_access,
  facingDirection: dbProperty.facing_direction,
  amenities: dbProperty.amenities,
  imageUrls: dbProperty.image_urls,
  featured: true,
  published: true,
};

const clientProperty: Property = {
  id: dbProperty.id,
  title: dbProperty.title,
  slug: dbProperty.slug,
  description: dbProperty.description,
  price: dbProperty.price,
  listingType: "Sale",
  propertyType: "House",
  status: "Available",
  location: dbProperty.location,
  city: dbProperty.city,
  areaSize: dbProperty.area_size,
  bedrooms: dbProperty.bedrooms,
  bathrooms: dbProperty.bathrooms,
  floors: dbProperty.floors,
  parkingSpaces: dbProperty.parking_spaces,
  roadAccess: dbProperty.road_access,
  facingDirection: dbProperty.facing_direction,
  amenities: dbProperty.amenities,
  imageUrls: dbProperty.image_urls,
  featuredImage: dbProperty.featured_image,
  featured: true,
  published: true,
  createdAt: dbProperty.created_at,
};

describe("PropNexus workflows", () => {
  it("sanitizes malformed gallery data and falls back to a valid featured image", () => {
    expect(sanitizePropertyImages(["", "not-a-url", "/manus-storage/valid.jpg", 7], "https://example.com/fallback.jpg")).toEqual(["/manus-storage/valid.jpg"]);
    expect(sanitizePropertyImages(["", "not-a-url"], "https://example.com/fallback.jpg")).toEqual(["https://example.com/fallback.jpg"]);
    expect(sanitizePropertyImages(["invalid"], "also-invalid")).toEqual([]);
    expect(resolveGalleryState(["invalid"], "https://example.com/fallback.jpg", 8)).toMatchObject({ images: ["https://example.com/fallback.jpg"], activeIndex: 0, hasNavigation: false });
    expect(resolveGalleryState(["/manus-storage/one.jpg", "/manus-storage/two.jpg"], "", 8)).toMatchObject({ activeIndex: 1, image: "/manus-storage/two.jpg", hasNavigation: true });
  });

  it("sorts price filters and recommends comparable available properties", () => {
    const nearby = { ...clientProperty, id: "nearby", title: "Comparable House", slug: "comparable-house", price: 33000000 };
    const lower = { ...clientProperty, id: "lower", title: "Lower Priced Land", slug: "lower-priced-land", propertyType: "Land" as const, city: "Chitwan", location: "Bharatpur", price: 12000000 };
    const unavailable = { ...nearby, id: "unavailable", title: "Unavailable House", slug: "unavailable-house", status: "Sold" as const };
    expect(sortProperties([clientProperty, nearby, lower], "price-low").map(item => item.id)).toEqual(["lower", clientProperty.id, "nearby"]);
    expect(sortProperties([clientProperty, nearby, lower], "price-high").map(item => item.id)).toEqual(["nearby", clientProperty.id, "lower"]);
    expect(getSimilarProperties(clientProperty, [clientProperty, lower, unavailable, nearby]).map(item => item.id)).toEqual(["nearby", "lower"]);
  });

  it("persists saved-property ids through browser storage helpers", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
    saveFavoriteIds(storage, ["first", "second"]);
    expect(values.get(FAVORITES_STORAGE_KEY)).toBe('["first","second"]');
    expect(readFavoriteIds(storage)).toEqual(["first", "second"]);
    expect(parseFavoriteIds("not-json")).toEqual([]);
  });

  it("retains the required public accessibility safeguards in key route sources", async () => {
    const root = new URL("../", import.meta.url);
      const [header, landing, catalogue, detail, stylesheet, inquiries, map, wishlist, comparisonRouter, recentHook] = await Promise.all([
      readFile(new URL("client/src/components/PublicHeader.tsx", root), "utf8"),
      readFile(new URL("client/src/pages/Landing.tsx", root), "utf8"),
      readFile(new URL("client/src/pages/Properties.tsx", root), "utf8"),
      readFile(new URL("client/src/pages/PropertyDetail.tsx", root), "utf8"),
      readFile(new URL("client/src/index.css", root), "utf8"),
      readFile(new URL("server/routers/inquiries.ts", root), "utf8"),
        readFile(new URL("client/src/components/Map.tsx", root), "utf8"),
        readFile(new URL("client/src/pages/Wishlist.tsx", root), "utf8"),
      readFile(new URL("server/routers/comparison.ts", root), "utf8"),
      readFile(new URL("client/src/hooks/useRecentlyViewed.ts", root), "utf8"),
    ]);
    expect(header).toContain('href="#main-content"');
    expect(header).toContain("setMenuOpen(true)");
    expect(header).toContain("setMenuOpen(false)");
    expect(header).toContain('href="/wishlist"');
    expect(landing).toContain('main id="main-content"');
    expect(catalogue).toContain('role="alert"');
    expect(detail).toContain('role="alert"');
    expect(stylesheet).toContain("prefers-reduced-motion");
    expect(landing).toContain('id="suggested-location"');
    expect(catalogue).toContain('aria-label="Property catalogue view"');
    expect(catalogue).toContain("MapView");
    expect(catalogue).toContain("createPropertyMarkerContent");
    expect(catalogue).toContain("createClusterMarkerContent");
    expect(catalogue).toContain("averagePrice");
    expect(catalogue).toContain("Avg");
    expect(catalogue).toContain("expandedPropertyIds");
    expect(catalogue).toContain("zoom_changed");
    expect(catalogue).toContain("formatNpr");
    expect(detail).toContain("Loading property image");
    expect(detail).toContain("animate-pulse");
    expect(landing).toContain('id="suggested-price"');
    expect(inquiries).toContain("notifyOwner");
    expect(inquiries).toContain("sendOwnerInquiryEmail");
    expect(detail).toContain('fetchPriority="high"');
    expect(detail).toContain('role="dialog"');
    expect(map).toContain("Map view is temporarily unavailable");
    expect(wishlist).toContain("Your wishlist is waiting.");
    expect(wishlist).toContain("clearFavorites");
    expect(wishlist).toContain('id="wishlist-sort"');
    expect(wishlist).toContain('id="wishlist-price"');
    expect(wishlist).toContain("Compare saved properties");
    expect(wishlist).toContain("compareIds");
    expect(wishlist).toContain("shareWishlist");
    expect(wishlist).toContain("wishlist=");
    expect(wishlist).toContain("isReadOnlyShared");
    expect(wishlist).toContain("read-only viewing");
    expect(wishlist).toContain("curated list of properties");
    expect(wishlist).toContain("Email PDF");
    expect(wishlist).toContain("comparison-email");
    expect(wishlist).toContain("personalMessage");
    expect(wishlist).toContain("recentlyViewedEntries");
    expect(wishlist).toContain("Clear history");
    expect(wishlist).toContain("Viewed");
    expect(wishlist).toContain("differenceKeys");
    expect(recentHook).toContain("RECENTLY_VIEWED_STORAGE_KEY");
    expect(recentHook).toContain("addRecentlyViewed");
    expect(recentHook).toContain("clearRecentlyViewed");
    expect(recentHook).toContain("viewedAt");
    expect(wishlist).toContain("rawalabhaya!@gmail.com");
    expect(wishlist).toContain("print-only");
    expect(wishlist).toContain("Export comparison PDF");
    expect(stylesheet).toContain("#comparison-print-area");
    expect(comparisonRouter).toContain("emailPdf");
    expect(comparisonRouter).toContain("personalMessage");
    expect(catalogue).toContain("createPropertyMarkerContent");
    expect(catalogue).toContain("mouseenter");
    expect(catalogue).toContain("Add to wishlist");
    expect(catalogue).toContain("onToggleFavorite");
  });

  it("maps Supabase properties for public property discovery", async () => {
    mocks.supabaseRest.mockResolvedValueOnce([dbProperty]);
    const result = await appRouter.createCaller(context("user")).properties.list();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ title: dbProperty.title, propertyType: "House" });
    expect(result[0].imageUrls[0]).toMatch(/^https:\/\/files\.manuscdn\.com\//);
  });

  it("forwards a custom personal message when emailing a comparison PDF", async () => {
    mocks.sendComparisonPdfEmail.mockResolvedValueOnce(true);
    const result = await appRouter.createCaller(context("user")).comparison.emailPdf({
      recipient: "family@example.com",
      personalMessage: "Please review the Pokhara option first.",
      properties: [{ title: "Test Kathmandu Residence", location: "Budhanilkantha", city: "Kathmandu", price: "Rs. 3.25 crore", propertyType: "House", areaSize: "4,100 sq. ft.", bedrooms: 5, status: "Available" }],
    });
    expect(result).toEqual({ success: true });
    expect(mocks.sendComparisonPdfEmail).toHaveBeenCalledWith("family@example.com", expect.any(Array), "Please review the Pokhara option first.");
  });

  it("creates an inquiry, saves the expected Supabase payload, and alerts the owner", async () => {
    mocks.supabaseRest.mockResolvedValueOnce(undefined);
    mocks.notifyOwner.mockResolvedValueOnce(true);
    mocks.sendOwnerInquiryEmail.mockResolvedValueOnce(true);
    const result = await appRouter.createCaller(context("user")).inquiries.create({ propertyId: dbProperty.id, name: "Prospective Buyer", phone: "+9779769279600", email: "buyer@example.com", message: "Please arrange a viewing." });
    expect(result).toEqual({ success: true, ownerAlertSent: true, emailAlertSent: true });
    expect(mocks.supabaseRest).toHaveBeenCalledWith("inquiries", expect.objectContaining({ method: "POST", body: expect.stringContaining("property_id") }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("Prospective Buyer"), content: expect.stringContaining("buyer@example.com") }));
    expect(mocks.sendOwnerInquiryEmail).toHaveBeenCalledWith(expect.objectContaining({ name: "Prospective Buyer", email: "buyer@example.com" }));
  });

  it("keeps a saved inquiry successful when the owner alert channel is unavailable", async () => {
    mocks.supabaseRest.mockResolvedValueOnce(undefined);
    mocks.notifyOwner.mockResolvedValueOnce(false);
    mocks.sendOwnerInquiryEmail.mockResolvedValueOnce(false);
    await expect(appRouter.createCaller(context("user")).inquiries.create({ propertyId: dbProperty.id, name: "Alert Fallback", phone: "+9779769279600", email: "", message: "Please call me back." })).resolves.toEqual({ success: true, ownerAlertSent: false, emailAlertSent: false });
  });

  it("updates a lead status from the protected owner inbox", async () => {
    mocks.supabaseRest.mockResolvedValueOnce(undefined);
    const result = await appRouter.createCaller(context()).inquiries.updateStatus({ id: dbProperty.id, status: "Contacted" });
    expect(result).toEqual({ success: true });
    expect(mocks.supabaseRest).toHaveBeenCalledWith(expect.stringContaining("inquiries?id=eq."), expect.objectContaining({ method: "PATCH", body: expect.stringContaining("Contacted") }));
  });

  it("creates a protected property listing with normalized database fields", async () => {
    mocks.supabaseRest.mockResolvedValueOnce([dbProperty]);
    const result = await appRouter.createCaller(context()).properties.create(propertyInput);
    expect(result.slug).toBe(dbProperty.slug);
    expect(mocks.supabaseRest).toHaveBeenCalledWith("properties", expect.objectContaining({ method: "POST", body: expect.stringContaining("listing_type") }));
  });

  it("updates an existing protected property listing", async () => {
    mocks.supabaseRest.mockResolvedValueOnce([{ ...dbProperty, title: "Updated Kathmandu Residence" }]);
    const result = await appRouter.createCaller(context()).properties.update({ id: dbProperty.id, data: { ...propertyInput, title: "Updated Kathmandu Residence" } });
    expect(result.title).toBe("Updated Kathmandu Residence");
    expect(mocks.supabaseRest).toHaveBeenCalledWith(expect.stringContaining(`properties?id=eq.${dbProperty.id}`), expect.objectContaining({ method: "PATCH" }));
  });

  it("deletes a protected property listing", async () => {
    mocks.supabaseRest.mockResolvedValueOnce(undefined);
    const result = await appRouter.createCaller(context()).properties.remove({ id: dbProperty.id });
    expect(result).toEqual({ success: true });
    expect(mocks.supabaseRest).toHaveBeenCalledWith(expect.stringContaining(`properties?id=eq.${dbProperty.id}`), expect.objectContaining({ method: "DELETE" }));
  });

  it("stores owner-uploaded property media through managed storage", async () => {
    mocks.storagePut.mockResolvedValueOnce({ key: "properties/1/test.jpg", url: "/manus-storage/test.jpg" });
    const result = await appRouter.createCaller(context()).media.upload({ fileName: "Front elevation.jpg", contentType: "image/jpeg", base64: Buffer.alloc(24, 7).toString("base64") });
    expect(result).toEqual({ url: "/manus-storage/test.jpg" });
    expect(mocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("properties/1/front-elevation.jpg"), expect.any(Buffer), "image/jpeg");
  });

  it("denies administration procedures to a non-owner", async () => {
    await expect(appRouter.createCaller(context("user")).properties.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("surfaces an inquiry persistence failure to the public caller", async () => {
    mocks.supabaseRest.mockRejectedValueOnce(new Error("Supabase is unavailable"));
    await expect(appRouter.createCaller(context("user")).inquiries.create({ propertyId: dbProperty.id, name: "Prospective Buyer", phone: "+9779769279600", email: "", message: "Please arrange a viewing." })).rejects.toThrow("Supabase is unavailable");
  });

  it("filters listings by Nepal ward, municipality, and minimum road width", () => {
    const listing = { ...dbProperty, ward: 3, municipality: "Budhanilkantha Municipality", roadWidth: 18 } as any;
    expect(applyFilters([listing], { ward: 3, municipality: "Budhanilkantha Municipality", minRoadWidth: 16 })).toHaveLength(1);
    expect(applyFilters([listing], { ward: 4 })).toHaveLength(0);
    expect(applyFilters([listing], { minRoadWidth: 20 })).toHaveLength(0);
  });

  it("parses a conversational Nepal property query safely without an LLM", () => {
    expect(parseNaturalLanguageFallback("Buy a three bedroom house in Lalitpur under 3 crore with a 16 ft road")).toMatchObject({ propertyType: "House", listingType: "Sale", location: "Lalitpur", maxPrice: 30000000, minRoadWidth: 16, bedroomsMin: 3 });
  });

  it("uses the natural-language mutation fallback and bounds returned listings", async () => {
    mocks.invokeLLM.mockRejectedValueOnce(new Error("LLM unavailable"));
    mocks.supabaseRest.mockResolvedValueOnce(Array.from({ length: 8 }, (_, index) => ({ ...dbProperty, id: `9a17b2d1-e5c6-4f22-b891-f5df0000000${index + 1}`, slug: `test-kathmandu-residence-${index}`, title: `Test Kathmandu Residence ${index}` })));
    const result = await appRouter.createCaller(context("user")).properties.naturalLanguageSearch({ query: "house in Kathmandu" });
    expect(result.propertyIds.length).toBeLessThanOrEqual(MAX_NATURAL_SEARCH_RESULTS);
    expect(result.properties.length).toBeLessThanOrEqual(MAX_NATURAL_SEARCH_RESULTS);
  });

  it("highlights differing comparison fields", () => {
    const first = { ...dbProperty, propertyType: "House", areaSize: "4,100 sq. ft.", price: 32000000 } as any;
    const second = { ...dbProperty, propertyType: "Apartment", areaSize: "1,650 sq. ft.", price: 19000000 } as any;
    const keys = getComparisonDifferenceKeys([first, second]);
    expect(keys.has("price")).toBe(true);
    expect(keys.has("type")).toBe(true);
    expect(keys.has("area")).toBe(true);
  });

  it("serializes saved searches and restores a bounded comparison share URL", () => {
    const saved: SavedSearch = { id: "search-1", label: "Apartment · Kathmandu · Any budget", criteria: { propertyType: "Apartment", listingType: "All", location: "", municipality: "Kathmandu Metropolitan City", ward: "3", roadWidth: "18", price: "all", sort: "newest", onlyFavorites: false } };
    expect(parseSavedSearches(serializeSavedSearches([saved]))).toEqual([saved]);
    const url = buildComparisonShareUrl("https://propnexus.example", ["a", "b", "c", "d"]);
    expect(url).toContain("compare=a%2Cb%2Cc");
    expect(parseComparisonIds(new URL(url).search)).toEqual(["a", "b", "c"]);
  });

  it("stores recent conversational queries with deduplication and a five-item cap", () => {
    const history = addQueryToHistory(["Older query"], "A house in Lalitpur");
    expect(addQueryToHistory(history, "a HOUSE in lalitpur")).toEqual(["a HOUSE in lalitpur", "Older query"]);
    const bounded = addQueryToHistory(["one", "two", "three", "four", "five"], "six");
    expect(parseQueryHistory(serializeQueryHistory(bounded))).toEqual(["six", "one", "two", "three", "four"]);
  });

  it("only exposes verified price-history points and leaves unverified listings without a chart", () => {
    const property = { price: 10000000, createdAt: "2026-01-01T00:00:00.000Z", priceHistory: [{ date: "2025-01-01", price: 9000000, verified: false }, { date: "2026-01-01", price: 10000000, verified: true }] } as Property;
    expect(getVerifiedPriceHistory(property)).toEqual([{ date: "2026-01-01", price: 10000000, verified: true }]);
    expect(getVerifiedPriceHistory({ price: 10000000, createdAt: "2026-01-01T00:00:00.000Z" })).toEqual([]);
  });

  it("exposes authenticated sync procedures for saved searches and AI history", () => {
    const procedures = syncRouter._def.procedures;
    expect(Object.keys(procedures)).toEqual(expect.arrayContaining(["savedSearches", "upsertSavedSearch", "deleteSavedSearch", "queryHistory", "upsertQuery", "clearQueryHistory"]));
  });

  it("keeps three guided search examples available as a stable contract", () => {
    expect(GUIDED_SEARCH_EXAMPLES).toHaveLength(3);
    expect(GUIDED_SEARCH_EXAMPLES.every(example => example.length > 10)).toBe(true);
  });

  it("limits comparison selection to three and supports removal", () => {
    expect(toggleComparisonId(["a", "b", "c"], "d")).toEqual(["a", "b", "c"]);
    expect(toggleComparisonId(["a", "b", "c"], "b")).toEqual(["a", "c"]);
    expect(toggleComparisonId(["a", "b"], "c")).toEqual(["a", "b", "c"]);
  });

  it("surfaces a lead-status update failure to the owner", async () => {
    mocks.supabaseRest.mockRejectedValueOnce(new Error("Supabase is unavailable"));
    await expect(appRouter.createCaller(context()).inquiries.updateStatus({ id: dbProperty.id, status: "Closed" })).rejects.toThrow("Supabase is unavailable");
  });
});

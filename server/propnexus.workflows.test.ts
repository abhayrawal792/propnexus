import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  supabaseRest: vi.fn(),
  storagePut: vi.fn(),
  notifyOwner: vi.fn(),
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

import { appRouter } from "./routers";
import { getSimilarProperties, resolveGalleryState, sanitizePropertyImages, sortProperties, type Property } from "../client/src/lib/property";
import { FAVORITES_STORAGE_KEY, parseFavoriteIds, readFavoriteIds, saveFavoriteIds } from "../client/src/hooks/useFavorites";

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
    const [header, landing, catalogue, detail, stylesheet, inquiries, map] = await Promise.all([
      readFile(new URL("client/src/components/PublicHeader.tsx", root), "utf8"),
      readFile(new URL("client/src/pages/Landing.tsx", root), "utf8"),
      readFile(new URL("client/src/pages/Properties.tsx", root), "utf8"),
      readFile(new URL("client/src/pages/PropertyDetail.tsx", root), "utf8"),
      readFile(new URL("client/src/index.css", root), "utf8"),
      readFile(new URL("server/routers/inquiries.ts", root), "utf8"),
      readFile(new URL("client/src/components/Map.tsx", root), "utf8"),
    ]);
    expect(header).toContain('href="#main-content"');
    expect(header).toContain("setMenuOpen(true)");
    expect(header).toContain("setMenuOpen(false)");
    expect(header).toContain('href="/properties?favorites=1"');
    expect(landing).toContain('main id="main-content"');
    expect(catalogue).toContain('role="alert"');
    expect(detail).toContain('role="alert"');
    expect(stylesheet).toContain("prefers-reduced-motion");
    expect(landing).toContain('id="suggested-location"');
    expect(landing).toContain('id="suggested-price"');
    expect(inquiries).toContain("notifyOwner");
    expect(detail).toContain('fetchPriority="high"');
    expect(detail).toContain('role="dialog"');
    expect(map).toContain("Map view is temporarily unavailable");
  });

  it("maps Supabase properties for public property discovery", async () => {
    mocks.supabaseRest.mockResolvedValueOnce([dbProperty]);
    const result = await appRouter.createCaller(context("user")).properties.list();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ title: dbProperty.title, propertyType: "House", imageUrls: dbProperty.image_urls });
  });

  it("creates an inquiry, saves the expected Supabase payload, and alerts the owner", async () => {
    mocks.supabaseRest.mockResolvedValueOnce(undefined);
    mocks.notifyOwner.mockResolvedValueOnce(true);
    const result = await appRouter.createCaller(context("user")).inquiries.create({ propertyId: dbProperty.id, name: "Prospective Buyer", phone: "+9779769279600", email: "buyer@example.com", message: "Please arrange a viewing." });
    expect(result).toEqual({ success: true, ownerAlertSent: true });
    expect(mocks.supabaseRest).toHaveBeenCalledWith("inquiries", expect.objectContaining({ method: "POST", body: expect.stringContaining("property_id") }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("Prospective Buyer"), content: expect.stringContaining("buyer@example.com") }));
  });

  it("keeps a saved inquiry successful when the owner alert channel is unavailable", async () => {
    mocks.supabaseRest.mockResolvedValueOnce(undefined);
    mocks.notifyOwner.mockResolvedValueOnce(false);
    await expect(appRouter.createCaller(context("user")).inquiries.create({ propertyId: dbProperty.id, name: "Alert Fallback", phone: "+9779769279600", email: "", message: "Please call me back." })).resolves.toEqual({ success: true, ownerAlertSent: false });
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

  it("surfaces a lead-status update failure to the owner", async () => {
    mocks.supabaseRest.mockRejectedValueOnce(new Error("Supabase is unavailable"));
    await expect(appRouter.createCaller(context()).inquiries.updateStatus({ id: dbProperty.id, status: "Closed" })).rejects.toThrow("Supabase is unavailable");
  });
});

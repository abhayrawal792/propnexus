import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PropertyRecord, seedProperties } from "../propertySeed";
import { isSchemaUnavailable, supabaseRest } from "../supabase";
import { publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "./_shared";

const propertyTypes = ["House", "Apartment", "Land", "Commercial"] as const;
const listingTypes = ["Sale", "Rent"] as const;
const statuses = ["Available", "Under Offer", "Sold", "Rented"] as const;

const propertyInput = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(20),
  price: z.number().nonnegative(),
  listingType: z.enum(listingTypes),
  propertyType: z.enum(propertyTypes),
  status: z.enum(statuses),
  location: z.string().min(2),
  city: z.string().min(2),
  areaSize: z.string().min(2),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  floors: z.number().int().min(0),
  parkingSpaces: z.number().int().min(0),
  roadAccess: z.string().optional().default(""),
  facingDirection: z.string().optional().default(""),
  amenities: z.array(z.string()).default([]),
  imageUrls: z.array(z.string()).min(1),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

const filterInput = z.object({
  propertyType: z.enum(propertyTypes).optional(),
  listingType: z.enum(listingTypes).optional(),
  location: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  featuredOnly: z.boolean().optional(),
}).optional();

type SupabaseProperty = Record<string, unknown>;

function mapProperty(row: SupabaseProperty): PropertyRecord {
  const imageUrls = Array.isArray(row.image_urls) ? row.image_urls.map(String) : Array.isArray(row.imageUrls) ? row.imageUrls.map(String) : [];
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    description: String(row.description || ""),
    price: Number(row.price),
    listingType: row.listing_type as PropertyRecord["listingType"],
    propertyType: row.property_type as PropertyRecord["propertyType"],
    status: row.status as PropertyRecord["status"],
    location: String(row.location),
    city: String(row.city),
    areaSize: String(row.area_size),
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    floors: Number(row.floors || 0),
    parkingSpaces: Number(row.parking_spaces || 0),
    roadAccess: String(row.road_access || ""),
    facingDirection: String(row.facing_direction || ""),
    amenities: Array.isArray(row.amenities) ? row.amenities.map(String) : [],
    imageUrls,
    featuredImage: String(row.featured_image || imageUrls[0] || ""),
    featured: Boolean(row.is_featured),
    published: Boolean(row.is_published),
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

async function listProperties(includeUnpublished = false) {
  try {
    const visibility = includeUnpublished ? "" : "&is_published=eq.true";
    const rows = await supabaseRest<SupabaseProperty[]>(`properties?select=*&order=created_at.desc${visibility}`);
    return rows.map(mapProperty);
  } catch (error) {
    if (isSchemaUnavailable(error)) return seedProperties;
    throw error;
  }
}

function applyFilters(properties: PropertyRecord[], filter?: z.infer<typeof filterInput>) {
  return properties.filter(property => {
    if (filter?.propertyType && property.propertyType !== filter.propertyType) return false;
    if (filter?.listingType && property.listingType !== filter.listingType) return false;
    if (filter?.location && !`${property.location} ${property.city}`.toLowerCase().includes(filter.location.toLowerCase())) return false;
    if (filter?.minPrice && property.price < filter.minPrice) return false;
    if (filter?.maxPrice && property.price > filter.maxPrice) return false;
    if (filter?.featuredOnly && !property.featured) return false;
    return true;
  });
}

function toDbProperty(input: z.infer<typeof propertyInput>) {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    price: input.price,
    listing_type: input.listingType,
    property_type: input.propertyType,
    status: input.status,
    location: input.location,
    city: input.city,
    area_size: input.areaSize,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    floors: input.floors,
    parking_spaces: input.parkingSpaces,
    road_access: input.roadAccess,
    facing_direction: input.facingDirection,
    amenities: input.amenities,
    image_urls: input.imageUrls,
    featured_image: input.imageUrls[0],
    is_featured: input.featured,
    is_published: input.published,
  };
}

export const propertiesRouter = router({
  list: publicProcedure.input(filterInput).query(async ({ input }) => applyFilters(await listProperties(false), input)),
  bySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
    const property = (await listProperties(false)).find(item => item.slug === input.slug);
    if (!property) throw new TRPCError({ code: "NOT_FOUND", message: "Property not found." });
    return property;
  }),
  adminList: adminProcedure.query(() => listProperties(true)),
  create: adminProcedure.input(propertyInput).mutation(async ({ input }) => {
    const result = await supabaseRest<SupabaseProperty[]>("properties", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(toDbProperty(input)),
    });
    return mapProperty(result[0]);
  }),
  update: adminProcedure.input(z.object({ id: z.string().uuid(), data: propertyInput })).mutation(async ({ input }) => {
    const result = await supabaseRest<SupabaseProperty[]>(`properties?id=eq.${encodeURIComponent(input.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(toDbProperty(input.data)),
    });
    return mapProperty(result[0]);
  }),
  remove: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => {
    await supabaseRest(`properties?id=eq.${encodeURIComponent(input.id)}`, { method: "DELETE" });
    return { success: true };
  }),
});

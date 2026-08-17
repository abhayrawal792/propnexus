import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PropertyRecord, seedProperties } from "../propertySeed";
import { isSchemaUnavailable, SupabaseRestError, supabaseRest } from "../supabase";
import { publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "./_shared";
import { resolvePropertyLocationMetadata, NEPAL_MUNICIPALITIES } from "../../shared/propertyMetadata";
import { invokeLLM } from "../_core/llm";

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
  ward: z.number().int().min(0).max(35).default(0),
  municipality: z.string().trim().max(120).default(""),
  roadWidth: z.number().int().min(0).max(100).default(0),
});

const filterInput = z.object({
  propertyType: z.enum(propertyTypes).optional(),
  listingType: z.enum(listingTypes).optional(),
  location: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  featuredOnly: z.boolean().optional(),
  ward: z.number().int().min(1).max(35).optional(),
  municipality: z.string().trim().max(120).optional(),
  minRoadWidth: z.number().int().min(0).max(100).optional(),
}).optional();

type SupabaseProperty = Record<string, unknown>;

const PUBLIC_PROPERTY_IMAGES = {
  hero: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663895754385/loHskZvgEyLEslRH.png",
  apartment: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663895754385/FXiiMBQJhKJhTrAL.jpg",
  commercial: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663895754385/eHGQGKLqtACbCfkP.jpg",
  commercialSpace: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663895754385/kThoAqCTJvPzDSFh.jpg",
  villa: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663895754385/rSrpfvQvsFWXyLAb.jpg",
} as const;

function toPublicImageUrl(value: string, propertyType?: string): string {
  if (!value.startsWith("/manus-storage/")) return value;
  const lower = value.toLowerCase();
  if (lower.includes("apartment")) return PUBLIC_PROPERTY_IMAGES.apartment;
  if (lower.includes("commercial-space") || lower.includes("space")) return PUBLIC_PROPERTY_IMAGES.commercialSpace;
  if (lower.includes("commercial") || lower.includes("office") || lower.includes("building")) return PUBLIC_PROPERTY_IMAGES.commercial;
  if (propertyType === "Apartment") return PUBLIC_PROPERTY_IMAGES.apartment;
  if (propertyType === "Commercial") return PUBLIC_PROPERTY_IMAGES.commercial;
  if (propertyType === "Land") return PUBLIC_PROPERTY_IMAGES.villa;
  return PUBLIC_PROPERTY_IMAGES.hero;
}

function mapProperty(row: SupabaseProperty): PropertyRecord {
  const propertyType = String(row.property_type || row.propertyType || "House");
  const rawImageUrls = Array.isArray(row.image_urls) ? row.image_urls.map(String) : Array.isArray(row.imageUrls) ? row.imageUrls.map(String) : [];
  const imageUrls = rawImageUrls.map(value => toPublicImageUrl(value, propertyType));
  const metadata = resolvePropertyLocationMetadata(String(row.slug || ""), String(row.location || ""), String(row.city || ""), String(row.road_access || ""));
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    description: String(row.description || ""),
    price: Number(row.price),
    listingType: row.listing_type as PropertyRecord["listingType"],
    propertyType: propertyType as PropertyRecord["propertyType"],
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
    featuredImage: toPublicImageUrl(String(row.featured_image || imageUrls[0] || ""), propertyType),
    featured: Boolean(row.is_featured),
    published: Boolean(row.is_published),
    createdAt: String(row.created_at || new Date().toISOString()),
    ward: Number(row.ward || metadata.ward),
    municipality: String(row.municipality || metadata.municipality),
    roadWidth: Number(row.road_width || metadata.roadWidth),
  };
}

async function listProperties(includeUnpublished = false) {
  try {
    const visibility = includeUnpublished ? "" : "&is_published=eq.true";
    const rows = await supabaseRest<SupabaseProperty[]>(`properties?select=*&order=created_at.desc${visibility}`);
    return rows.map(mapProperty);
  } catch (error) {
    if (isSchemaUnavailable(error) || (error instanceof SupabaseRestError && error.status === 503)) return seedProperties;
    throw error;
  }
}

export function applyFilters(properties: PropertyRecord[], filter?: z.infer<typeof filterInput>) {
  return properties.filter(property => {
    if (filter?.propertyType && property.propertyType !== filter.propertyType) return false;
    if (filter?.listingType && property.listingType !== filter.listingType) return false;
    if (filter?.location && !`${property.location} ${property.city}`.toLowerCase().includes(filter.location.toLowerCase())) return false;
    if (filter?.minPrice && property.price < filter.minPrice) return false;
    if (filter?.maxPrice && property.price > filter.maxPrice) return false;
    if (filter?.featuredOnly && !property.featured) return false;
    if (filter?.ward && property.ward !== filter.ward) return false;
    if (filter?.municipality && property.municipality !== filter.municipality) return false;
    if (filter?.minRoadWidth && property.roadWidth < filter.minRoadWidth) return false;
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
    ward: input.ward,
    municipality: input.municipality,
    road_width: input.roadWidth,
  };
}

const naturalSearchInput = z.object({ query: z.string().trim().min(3).max(500) });
export const MAX_NATURAL_SEARCH_RESULTS = 6;
const naturalSearchSchema = {
  name: "propnexus_search_intent",
  strict: true,
  schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      propertyType: { type: ["string", "null"], enum: ["House", "Apartment", "Land", "Commercial", null] },
      listingType: { type: ["string", "null"], enum: ["Sale", "Rent", null] },
      location: { type: ["string", "null"] },
      municipality: { type: ["string", "null"], enum: [...NEPAL_MUNICIPALITIES, null] },
      ward: { type: ["integer", "null"] },
      minRoadWidth: { type: ["integer", "null"] },
      maxPrice: { type: ["number", "null"] },
      bedroomsMin: { type: ["integer", "null"] },
    },
    required: ["summary", "propertyType", "listingType", "location", "municipality", "ward", "minRoadWidth", "maxPrice", "bedroomsMin"],
    additionalProperties: false,
  },
} as const;

type NaturalSearchIntent = { summary: string; propertyType: (typeof propertyTypes)[number] | null; listingType: (typeof listingTypes)[number] | null; location: string | null; municipality: string | null; ward: number | null; minRoadWidth: number | null; maxPrice: number | null; bedroomsMin: number | null };

export function parseNaturalLanguageFallback(query: string): NaturalSearchIntent {
  const text = query.toLowerCase();
  const numberWords: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  const propertyType = text.includes("apartment") || text.includes("flat") ? "Apartment" : text.includes("land") || text.includes("plot") ? "Land" : text.includes("commercial") || text.includes("office") || text.includes("shop") ? "Commercial" : text.includes("house") || text.includes("villa") || text.includes("home") ? "House" : null;
  const listingType = text.includes("rent") || text.includes("rental") || text.includes("lease") ? "Rent" : text.includes("buy") || text.includes("sale") || text.includes("purchase") ? "Sale" : null;
  const location = ["Kathmandu", "Lalitpur", "Patan", "Pokhara", "Chitwan", "Bhaktapur", "Tokha", "Thamel", "Budhanilkantha", "Maharajgunj", "Bhaisepati", "Kirtipur", "Biratnagar"].find(item => text.includes(item.toLowerCase())) ?? null;
  const wardMatch = text.match(/ward\s*(\d{1,2})/);
  const roadMatch = text.match(/(\d{1,2})\s*(?:ft|feet|foot)\s*(?:road|access)?/);
  const croreMatch = text.match(/(?:under|below|max(?:imum)?|up to)\s*(\d+(?:\.\d+)?)\s*crore/);
  const bedroomsMatch = text.match(/(\d+)\s*(?:bed|bedroom)/);
  const bedroomWordMatch = text.match(/\b(one|two|three|four|five|six)\s*(?:bed|bedroom)/);
  return { summary: `Searching Nepal listings for “${query.trim()}”.`, propertyType, listingType, location, municipality: null, ward: wardMatch ? Number(wardMatch[1]) : null, minRoadWidth: roadMatch ? Number(roadMatch[1]) : null, maxPrice: croreMatch ? Number(croreMatch[1]) * 10000000 : null, bedroomsMin: bedroomsMatch ? Number(bedroomsMatch[1]) : bedroomWordMatch ? numberWords[bedroomWordMatch[1]] : null };
}

function intentToFilter(intent: NaturalSearchIntent): z.infer<typeof filterInput> {
  return { propertyType: intent.propertyType ?? undefined, listingType: intent.listingType ?? undefined, location: intent.location ?? undefined, municipality: intent.municipality ?? undefined, ward: intent.ward ?? undefined, minRoadWidth: intent.minRoadWidth ?? undefined, maxPrice: intent.maxPrice ?? undefined };
}

export const propertiesRouter = router({
  list: publicProcedure.input(filterInput).query(async ({ input }) => applyFilters(await listProperties(false), input)),
  naturalLanguageSearch: publicProcedure.input(naturalSearchInput).mutation(async ({ input }) => {
    const fallback = parseNaturalLanguageFallback(input.query);
    let intent = fallback;
    try {
      const response = await invokeLLM({ messages: [
        { role: "system", content: "You interpret Nepal property searches. Return only the requested JSON schema. Use only supported property types, listing types, municipalities, numeric ward, minimum road width in feet, maximum NPR price, and minimum bedrooms. Do not invent a municipality outside the supplied enum." },
        { role: "user", content: `Supported municipalities: ${NEPAL_MUNICIPALITIES.join(", ")}\nUser query: ${input.query}` },
      ], outputSchema: naturalSearchSchema });
      const content = response?.choices?.[0]?.message?.content;
      if (typeof content === "string") intent = { ...fallback, ...JSON.parse(content) } as NaturalSearchIntent;
    } catch (error) {
      console.warn("[Properties] Natural-language search fallback", error);
    }
    const properties = await listProperties(false);
    const filtered = applyFilters(properties, intentToFilter(intent)).filter(property => !intent.bedroomsMin || property.bedrooms >= intent.bedroomsMin);
    const bounded = filtered.slice(0, MAX_NATURAL_SEARCH_RESULTS);
    return { intent, propertyIds: bounded.map(property => property.id), properties: bounded };
  }),
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

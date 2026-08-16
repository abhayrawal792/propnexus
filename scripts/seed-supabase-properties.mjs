const configuredUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!configuredUrl || !serviceKey) throw new Error("Supabase server configuration is unavailable.");

const baseUrl = configuredUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const imageUrls = [
  "/manus-storage/kathmandu-villa_294ae902.jpg",
  "/manus-storage/apartment-residence_3e47db4d.jpg",
  "/manus-storage/hillside-house_152b67cb.png",
  "/manus-storage/commercial-space_0d88bd69.jpg",
  "/manus-storage/commercial-building_36a09f80.jpg",
];

const entries = [
  ["Budhanilkantha Courtyard Villa", "budhanilkantha-courtyard-villa", "House", 32500000, "4,100 sq. ft.", 5, 5, "Budhanilkantha", "Kathmandu", "18 ft paved road", "East"],
  ["Maharajgunj Garden Residence", "maharajgunj-garden-residence", "House", 47500000, "5,250 sq. ft.", 5, 6, "Maharajgunj", "Kathmandu", "20 ft blacktop road", "South-East"],
  ["Lazimpat Skyline Apartment", "lazimpat-skyline-apartment", "Apartment", 19500000, "1,650 sq. ft.", 3, 3, "Lazimpat", "Kathmandu", "Dedicated driveway", "North"],
  ["Bhaisepati Ridge Townhome", "bhaisepati-ridge-townhome", "House", 28500000, "2,980 sq. ft.", 4, 4, "Bhaisepati", "Kathmandu", "16 ft paved road", "West"],
  ["Baluwatar Executive Suite", "baluwatar-executive-suite", "Apartment", 125000, "1,340 sq. ft.", 2, 2, "Baluwatar", "Kathmandu", "Basement access", "East"],
  ["Dillibazar High Street Retail", "dillibazar-high-street-retail", "Commercial", 220000, "1,150 sq. ft.", 0, 1, "Dillibazar", "Kathmandu", "Main road frontage", "South"],
  ["Hattiban View Plot", "hattiban-view-plot", "Land", 8500000, "5 Aana", 0, 0, "Hattiban", "Kathmandu", "13 ft gravel road", "North-East"],
  ["Tokha Corner Land", "tokha-corner-land", "Land", 12500000, "7 Aana", 0, 0, "Tokha", "Kathmandu", "20 ft blacktop road", "West"],
  ["Thamel Boutique Building", "thamel-boutique-building", "Commercial", 76500000, "4,850 sq. ft.", 0, 4, "Thamel", "Kathmandu", "14 ft heritage lane", "South"],
  ["Patan Heritage Apartment", "patan-heritage-apartment", "Apartment", 16250000, "1,420 sq. ft.", 3, 2, "Patan", "Kathmandu", "Gated approach", "East"],
  ["Kirtipur Hillside Residence", "kirtipur-hillside-residence", "House", 21800000, "3,200 sq. ft.", 4, 4, "Kirtipur", "Kathmandu", "16 ft paved road", "North"],
  ["Chitwan Resort Land", "chitwan-resort-land", "Land", 6800000, "12 Kattha", 0, 0, "Chitwan", "Chitwan", "Highway connection", "South-East"],
];

const records = entries.map(([title, slug, propertyType, price, areaSize, bedrooms, bathrooms, location, city, roadAccess, facingDirection], index) => {
  const image = imageUrls[index % imageUrls.length];
  return {
    title,
    slug,
    description: `A thoughtfully positioned ${propertyType.toLowerCase()} in ${location}, selected for its setting, practical specifications, and clear approach road. Contact PropNexus to arrange a private viewing and receive the complete property dossier.`,
    price,
    listing_type: index === 4 || index === 5 ? "Rent" : "Sale",
    property_type: propertyType,
    status: index === 7 ? "Under Offer" : "Available",
    location,
    city,
    area_size: areaSize,
    bedrooms,
    bathrooms,
    floors: propertyType === "House" ? 3 : propertyType === "Commercial" ? 4 : 1,
    parking_spaces: propertyType === "Land" ? 0 : propertyType === "Apartment" ? 1 : 2,
    road_access: roadAccess,
    facing_direction: facingDirection,
    amenities: propertyType === "Land" ? ["Road access", "Water connection", "Electricity nearby"] : ["Water supply", "Backup power", "Security", "Parking"],
    image_urls: [image, imageUrls[(index + 1) % imageUrls.length], imageUrls[(index + 2) % imageUrls.length]],
    featured_image: image,
    is_featured: index < 6,
    is_published: true,
  };
});

const response = await fetch(`${baseUrl}/rest/v1/properties?on_conflict=slug`, {
  method: "POST",
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify(records),
});

const body = await response.text();
if (!response.ok) throw new Error(`Property seed failed (${response.status}): ${body.slice(0, 600)}`);
console.log(`Supabase property seed complete: ${records.length} listings upserted.`);

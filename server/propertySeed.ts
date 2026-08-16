export type PropertyRecord = {
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

const images = {
  villa: "/manus-storage/kathmandu-villa_294ae902.jpg",
  apartment: "/manus-storage/apartment-residence_3e47db4d.jpg",
  commercial: "/manus-storage/commercial-space_0d88bd69.jpg",
  building: "/manus-storage/commercial-building_36a09f80.jpg",
  hillside: "/manus-storage/hillside-house_152b67cb.png",
};

const details = [
  ["Budhanilkantha Courtyard Villa", "budhanilkantha", "House", 32500000, "4,100 sq. ft.", 5, 5, "18 ft paved road", "East"],
  ["Maharajgunj Garden Residence", "maharajgunj", "House", 47500000, "5,250 sq. ft.", 5, 6, "20 ft blacktop road", "South-East"],
  ["Lazimpat Skyline Apartment", "lazimpat", "Apartment", 19500000, "1,650 sq. ft.", 3, 3, "Dedicated driveway", "North"],
  ["Bhaisepati Ridge Townhome", "bhaisepati", "House", 28500000, "2,980 sq. ft.", 4, 4, "16 ft paved road", "West"],
  ["Baluwatar Executive Suite", "baluwatar", "Apartment", 125000, "1,340 sq. ft.", 2, 2, "Basement access", "East"],
  ["Dillibazar High Street Retail", "dillibazar", "Commercial", 220000, "1,150 sq. ft.", 0, 1, "Main road frontage", "South"],
  ["Hattiban View Plot", "hattiban", "Land", 8500000, "5 Aana", 0, 0, "13 ft gravel road", "North-East"],
  ["Tokha Corner Land", "tokha", "Land", 12500000, "7 Aana", 0, 0, "20 ft blacktop road", "West"],
  ["Thamel Boutique Building", "thamel", "Commercial", 76500000, "4,850 sq. ft.", 0, 4, "14 ft heritage lane", "South"],
  ["Patan Heritage Apartment", "patan", "Apartment", 16250000, "1,420 sq. ft.", 3, 2, "Gated approach", "East"],
  ["Kirtipur Hillside Residence", "kirtipur", "House", 21800000, "3,200 sq. ft.", 4, 4, "16 ft paved road", "North"],
  ["Chitwan Resort Land", "chitwan", "Land", 6800000, "12 Kattha", 0, 0, "Highway connection", "South-East"],
] as const;

export const seedProperties: PropertyRecord[] = details.map((detail, index) => {
  const [title, location, propertyType, price, areaSize, bedrooms, bathrooms, roadAccess, facingDirection] = detail;
  const imageCycle = [images.villa, images.apartment, images.hillside, images.commercial, images.building];
  const featuredImage = imageCycle[index % imageCycle.length];
  const isRental = index === 4 || index === 5;
  const status = index === 7 ? "Under Offer" : "Available";

  return {
    id: `demo-${index + 1}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    description: `A thoughtfully positioned ${propertyType.toLowerCase()} in ${location}, selected for its setting, practical specifications, and clear approach road. Contact PropNexus to arrange a private viewing and receive the complete property dossier.`,
    price,
    listingType: isRental ? "Rent" : "Sale",
    propertyType: propertyType as PropertyRecord["propertyType"],
    status: status as PropertyRecord["status"],
    location: location.replace(/\b\w/g, char => char.toUpperCase()),
    city: index === 11 ? "Chitwan" : "Kathmandu",
    areaSize,
    bedrooms,
    bathrooms,
    floors: propertyType === "House" ? 3 : propertyType === "Commercial" ? 4 : 1,
    parkingSpaces: propertyType === "Land" ? 0 : propertyType === "Apartment" ? 1 : 2,
    roadAccess,
    facingDirection,
    amenities: propertyType === "Land" ? ["Road access", "Water connection", "Electricity nearby"] : ["Water supply", "Backup power", "Security", "Parking"],
    imageUrls: [featuredImage, imageCycle[(index + 1) % imageCycle.length], imageCycle[(index + 2) % imageCycle.length]],
    featuredImage,
    featured: index < 6,
    published: true,
    createdAt: new Date(Date.now() - index * 86400000 * 6).toISOString(),
  };
});

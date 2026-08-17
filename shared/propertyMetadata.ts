export type NepalLocationMetadata = {
  ward: number;
  municipality: string;
  roadWidth: number;
};

export const PROPERTY_LOCATION_METADATA: Record<string, NepalLocationMetadata> = {
  "budhanilkantha-courtyard-villa": { ward: 3, municipality: "Budhanilkantha Municipality", roadWidth: 18 },
  "maharajgunj-garden-residence": { ward: 3, municipality: "Kathmandu Metropolitan City", roadWidth: 20 },
  "bhaisepati-ridge-townhome": { ward: 25, municipality: "Lalitpur Metropolitan City", roadWidth: 16 },
  "kirtipur-hillside-residence": { ward: 7, municipality: "Kirtipur Municipality", roadWidth: 16 },
  "lazimpat-skyline-apartment": { ward: 2, municipality: "Kathmandu Metropolitan City", roadWidth: 22 },
  "baluwatar-executive-suite": { ward: 4, municipality: "Kathmandu Metropolitan City", roadWidth: 18 },
  "patan-heritage-apartment": { ward: 16, municipality: "Lalitpur Metropolitan City", roadWidth: 16 },
  "pokhara-lakeside-apartment": { ward: 6, municipality: "Pokhara Metropolitan City", roadWidth: 18 },
  "dillibazar-high-street-retail": { ward: 30, municipality: "Kathmandu Metropolitan City", roadWidth: 14 },
  "thamel-boutique-building": { ward: 26, municipality: "Kathmandu Metropolitan City", roadWidth: 14 },
  "biratnagar-trade-hub": { ward: 3, municipality: "Biratnagar Metropolitan City", roadWidth: 24 },
  "newroad-office-building": { ward: 22, municipality: "Kathmandu Metropolitan City", roadWidth: 18 },
  "hattiban-view-plot": { ward: 15, municipality: "Godawari Municipality", roadWidth: 13 },
  "tokha-corner-land": { ward: 5, municipality: "Tokha Municipality", roadWidth: 20 },
  "chitwan-resort-land": { ward: 10, municipality: "Bharatpur Metropolitan City", roadWidth: 24 },
  "bhaktapur-residential-plot": { ward: 8, municipality: "Suryabinayak Municipality", roadWidth: 16 },
};

export const NEPAL_MUNICIPALITIES = Array.from(new Set(Object.values(PROPERTY_LOCATION_METADATA).map(item => item.municipality))).sort();
export const NEPAL_WARDS = Array.from(new Set(Object.values(PROPERTY_LOCATION_METADATA).map(item => item.ward))).sort((a, b) => a - b);
export const NEPAL_ROAD_WIDTHS = Array.from(new Set(Object.values(PROPERTY_LOCATION_METADATA).map(item => item.roadWidth))).sort((a, b) => a - b);

export function resolvePropertyLocationMetadata(slug: string, location = "", city = "", roadAccess = ""): NepalLocationMetadata {
  const known = PROPERTY_LOCATION_METADATA[slug];
  if (known) return known;
  const municipality = city ? `${city} Municipality` : location || "Nepal location";
  const width = Number.parseInt(roadAccess.match(/\d+/)?.[0] ?? "0", 10);
  return { ward: 0, municipality, roadWidth: Number.isFinite(width) ? width : 0 };
}

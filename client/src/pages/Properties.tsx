import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import PropertyCard from "@/components/PropertyCard";
import { MapView } from "@/components/Map";
import { formatNpr, getPropertyCoordinates, Property, PropertySort, sortProperties, toggleComparisonId } from "@/lib/property";
import { parseSavedSearches, SAVED_SEARCHES_KEY, SavedSearch, SavedSearchCriteria, serializeSavedSearches } from "@/lib/discovery";
import { trpc } from "@/lib/trpc";
import { Bookmark, Filter, List, MapPinned, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useFavorites } from "@/hooks/useFavorites";
import { NEPAL_MUNICIPALITIES, NEPAL_ROAD_WIDTHS, NEPAL_WARDS } from "../../../shared/propertyMetadata";

function createPropertyMarkerContent(property: Property, initiallySaved: boolean, onToggleFavorite: (propertyId: string) => void) {
  const root = document.createElement("div");
  root.style.cssText = "position:relative;display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:pointer;";
  const pricePill = document.createElement("div");
  pricePill.textContent = formatNpr(property.price, property.listingType).replace(" / mo.", " /mo");
  pricePill.style.cssText = "background:#0b1c2f;color:#f7d98f;border:1px solid #d7b16c;border-radius:999px;padding:6px 9px;font:700 11px/1.1 ui-sans-serif,system-ui;white-space:nowrap;box-shadow:0 4px 14px rgba(8,23,41,.25);";
  const preview = document.createElement("div");
  preview.style.cssText = "display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);width:190px;padding:8px;border-radius:12px;background:#fff;color:#10243a;box-shadow:0 12px 30px rgba(8,23,41,.25);z-index:5;";
  const image = document.createElement("img"); image.src = property.featuredImage; image.alt = property.title; image.style.cssText = "display:block;width:100%;height:82px;object-fit:cover;border-radius:8px;";
  const title = document.createElement("p"); title.textContent = property.title; title.style.cssText = "margin:7px 2px 0;font:700 12px/1.25 ui-sans-serif,system-ui;";
  const meta = document.createElement("p"); meta.textContent = `${formatNpr(property.price, property.listingType)} · ${property.location}, ${property.city}`; meta.style.cssText = "margin:4px 2px 0;color:#64748b;font:500 10px/1.35 ui-sans-serif,system-ui;";
  const wishlistButton = document.createElement("button");
  let saved = initiallySaved;
  const syncWishlistButton = () => { wishlistButton.textContent = saved ? "Saved to wishlist" : "Add to wishlist"; wishlistButton.setAttribute("aria-pressed", String(saved)); wishlistButton.style.cssText = `display:block;width:100%;margin-top:8px;border:0;border-radius:999px;padding:6px 8px;background:${saved ? "#d7b16c" : "#0b1c2f"};color:${saved ? "#10243a" : "#f7d98f"};font:700 10px/1 ui-sans-serif,system-ui;cursor:pointer;`; };
  wishlistButton.setAttribute("aria-label", `${saved ? "Remove" : "Add"} ${property.title} ${saved ? "from" : "to"} wishlist`);
  wishlistButton.addEventListener("click", event => { event.stopPropagation(); saved = !saved; onToggleFavorite(property.id); wishlistButton.setAttribute("aria-label", `${saved ? "Remove" : "Add"} ${property.title} ${saved ? "from" : "to"} wishlist`); syncWishlistButton(); });
  syncWishlistButton();
  preview.append(image, title, meta, wishlistButton); root.append(pricePill, preview);
  root.addEventListener("mouseenter", () => { preview.style.display = "block"; });
  root.addEventListener("mouseleave", () => { preview.style.display = "none"; });
  return root;
}

function createClusterMarkerContent(count: number, averagePrice: string) {
  const root = document.createElement("div");
  root.textContent = `${count} properties · Avg ${averagePrice}`;
  root.style.cssText = "display:grid;place-items:center;min-width:82px;height:42px;padding:0 10px;background:#d7b16c;color:#10243a;border:2px solid #0b1c2f;border-radius:999px;font:800 11px/1 ui-sans-serif,system-ui;white-space:nowrap;box-shadow:0 5px 16px rgba(8,23,41,.28);cursor:pointer;";
  return root;
}

function setupClusteredMarkers(map: google.maps.Map, properties: Property[], navigate: (path: string) => void, favoriteIds: string[], onToggleFavorite: (propertyId: string) => void) {
  let markers: google.maps.marker.AdvancedMarkerElement[] = [];
  const expandedPropertyIds = new Set<string>();
  const render = () => {
    markers.forEach(marker => { marker.map = null; });
    const zoom = map.getZoom() ?? 11;
    const cellSize = zoom >= 13 ? 0.02 : zoom >= 11 ? 0.06 : 0.14;
    const groups = new Map<string, Property[]>();
    properties.forEach(property => {
      const coordinate = getPropertyCoordinates(property);
      const key = `${Math.round(coordinate.lat / cellSize)}:${Math.round(coordinate.lng / cellSize)}`;
      groups.set(key, [...(groups.get(key) ?? []), property]);
    });
    const renderGroups: Array<{ key: string; group: Property[] }> = [];
    groups.forEach((group, key) => {
      if (group.length > 1 && group.some(property => expandedPropertyIds.has(property.id))) group.forEach(property => renderGroups.push({ key: `${key}:${property.id}`, group: [property] }));
      else renderGroups.push({ key, group });
    });
    markers = renderGroups.map(({ key: groupKey, group }) => {
      const first = group[0];
      const coordinates = group.reduce((center, property) => { const point = getPropertyCoordinates(property); return { lat: center.lat + point.lat / group.length, lng: center.lng + point.lng / group.length }; }, { lat: 0, lng: 0 });
      const averagePrice = formatNpr(group.reduce((total, property) => total + property.price, 0) / group.length, group.every(property => property.listingType === "Rent") ? "Rent" : "Sale"); const content = group.length === 1 ? createPropertyMarkerContent(first, favoriteIds.includes(first.id), onToggleFavorite) : createClusterMarkerContent(group.length, averagePrice);
      const marker = new window.google.maps.marker.AdvancedMarkerElement({ map, position: coordinates, title: group.length === 1 ? `${first.title} — ${formatNpr(first.price, first.listingType)}` : `${group.length} nearby properties`, content });
      marker.addListener("click", () => { if (group.length === 1) navigate(`/properties/${first.slug}`); else { group.forEach(property => expandedPropertyIds.add(property.id)); map.setZoom(Math.min((map.getZoom() ?? 11) + 3, 18)); map.panTo(coordinates); render(); } });
      return marker;
    });
  };
  render();
  map.addListener("zoom_changed", render);
}

const typeOptions = ["All", "House", "Apartment", "Land", "Commercial"] as const;
const priceOptions = [
  { label: "Any budget", value: "all" },
  { label: "Up to Rs. 1 crore", value: "10000000" },
  { label: "Rs. 1–3 crore", value: "30000000" },
  { label: "Above Rs. 3 crore", value: "999999999" },
];

export default function Properties() {
  const initialSearch = new URLSearchParams(useSearch());
  const requestedType = initialSearch.get("type");
  const requestedListing = initialSearch.get("listing");
  const requestedBudget = initialSearch.get("max");
  const requestedWard = Number(initialSearch.get("ward") ?? "0");
  const requestedRoadWidth = Number(initialSearch.get("roadWidth") ?? "0");
  const [propertyType, setPropertyType] = useState<(typeof typeOptions)[number]>(() => typeOptions.includes(requestedType as (typeof typeOptions)[number]) ? requestedType as (typeof typeOptions)[number] : "All");
  const [listingType, setListingType] = useState<"All" | "Sale" | "Rent">(() => requestedListing === "Sale" || requestedListing === "Rent" ? requestedListing : "All");
  const [location, setLocation] = useState(() => initialSearch.get("location") ?? "");
  const [municipality, setMunicipality] = useState(() => initialSearch.get("municipality") ?? "All");
  const [ward, setWard] = useState(() => requestedWard > 0 ? String(requestedWard) : "All");
  const [roadWidth, setRoadWidth] = useState(() => requestedRoadWidth > 0 ? String(requestedRoadWidth) : "all");
  const [price, setPrice] = useState(() => priceOptions.some(option => option.value === requestedBudget) ? requestedBudget as string : "all");
  const [sort, setSort] = useState<PropertySort>(() => ["newest", "price-low", "price-high", "location", "type"].includes(initialSearch.get("sort") ?? "") ? initialSearch.get("sort") as PropertySort : "newest");
  const [onlyFavorites, setOnlyFavorites] = useState(() => initialSearch.get("favorites") === "1");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [, navigate] = useLocation();
  const { favoriteIds, clearFavorites, toggleFavorite } = useFavorites();
  const [compareIds, setCompareIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("propnexus_compare_ids") ?? "[]").slice(0, 3); } catch { return []; } });
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => parseSavedSearches(localStorage.getItem(SAVED_SEARCHES_KEY)));
  useEffect(() => { localStorage.setItem("propnexus_compare_ids", JSON.stringify(compareIds)); }, [compareIds]);
  useEffect(() => { localStorage.setItem(SAVED_SEARCHES_KEY, serializeSavedSearches(savedSearches)); }, [savedSearches]);
  const toggleCompare = (id: string) => setCompareIds(current => toggleComparisonId(current, id));
  const currentCriteria: SavedSearchCriteria = { propertyType, listingType, location, municipality, ward, roadWidth, price, sort, onlyFavorites };
  const saveCurrentSearch = () => { const label = [propertyType !== "All" ? propertyType : "Properties", municipality !== "All" ? municipality.replace(" Municipality", "") : location || "Nepal", price !== "all" ? priceOptions.find(option => option.value === price)?.label : "Any budget"].join(" · "); setSavedSearches(current => [{ id: `${Date.now()}`, label, criteria: currentCriteria }, ...current].slice(0, 8)); };
  const loadSavedSearch = (saved: SavedSearch) => { const criteria = saved.criteria; setPropertyType(criteria.propertyType); setListingType(criteria.listingType); setLocation(criteria.location); setMunicipality(criteria.municipality); setWard(criteria.ward); setRoadWidth(criteria.roadWidth); setPrice(criteria.price); setSort(criteria.sort); setOnlyFavorites(criteria.onlyFavorites); };

  const filters = useMemo(() => ({
    propertyType: propertyType === "All" ? undefined : propertyType,
    listingType: listingType === "All" ? undefined : listingType,
    location: location || undefined,
    municipality: municipality === "All" ? undefined : municipality,
    ward: ward === "All" ? undefined : Number(ward),
    minRoadWidth: roadWidth === "all" ? undefined : Number(roadWidth),
    maxPrice: price === "all" || price === "999999999" ? undefined : Number(price),
    minPrice: price === "999999999" ? 30000001 : undefined,
  }), [propertyType, listingType, location, municipality, ward, roadWidth, price]);
  const propertiesQuery = trpc.properties.list.useQuery(filters);
  const compareProperties = ((propertiesQuery.data ?? []) as Property[]).filter(property => compareIds.includes(property.id));
  const properties = useMemo(() => sortProperties(((propertiesQuery.data ?? []) as Property[]).filter(property => !onlyFavorites || favoriteIds.includes(property.id)), sort), [propertiesQuery.data, onlyFavorites, favoriteIds, sort]);

  const clear = () => { setPropertyType("All"); setListingType("All"); setLocation(""); setMunicipality("All"); setWard("All"); setRoadWidth("all"); setPrice("all"); setSort("newest"); setOnlyFavorites(false); };
  const controls = (
    <div className="grid gap-5">
      <div><label className="catalog-label">Property type</label><div className="mt-2 flex flex-wrap gap-2">{typeOptions.map(option => <button key={option} onClick={() => setPropertyType(option)} className={`rounded-full border px-3.5 py-2 text-[11px] font-bold transition ${propertyType === option ? "border-[#b78c43] bg-[#10243a] text-white" : "border-[#10243a]/15 bg-white text-[#10243a] hover:border-[#b78c43]"}`}>{option}</button>)}</div></div>
      <div><label className="catalog-label">Listing</label><div className="mt-2 grid grid-cols-2 rounded-xl bg-[#e9e4d8] p-1"><button onClick={() => setListingType("Sale")} className={`rounded-lg py-2 text-[11px] font-bold ${listingType === "Sale" ? "bg-[#10243a] text-white" : "text-slate-500"}`}>Buy</button><button onClick={() => setListingType("Rent")} className={`rounded-lg py-2 text-[11px] font-bold ${listingType === "Rent" ? "bg-[#10243a] text-white" : "text-slate-500"}`}>Rent</button></div></div>
      <div><label className="catalog-label" htmlFor="catalog-location">Location</label><div className="relative mt-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="catalog-location" value={location} onChange={event => setLocation(event.target.value)} placeholder="Kathmandu, Chitwan..." className="h-11 w-full rounded-xl border border-[#10243a]/15 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#b78c43]" /></div></div>
      <div><label className="catalog-label" htmlFor="catalog-municipality">Municipality</label><select id="catalog-municipality" value={municipality} onChange={event => setMunicipality(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#10243a]/15 bg-white px-3 text-sm outline-none focus:border-[#b78c43]"><option value="All">All municipalities</option>{NEPAL_MUNICIPALITIES.map(item => <option key={item} value={item}>{item}</option>)}</select></div>
      <div><label className="catalog-label" htmlFor="catalog-ward">Ward</label><select id="catalog-ward" value={ward} onChange={event => setWard(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#10243a]/15 bg-white px-3 text-sm outline-none focus:border-[#b78c43]"><option value="All">All wards</option>{NEPAL_WARDS.map(item => <option key={item} value={item}>Ward {item}</option>)}</select></div>
      <div><label className="catalog-label" htmlFor="catalog-road-width">Minimum road width</label><select id="catalog-road-width" value={roadWidth} onChange={event => setRoadWidth(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#10243a]/15 bg-white px-3 text-sm outline-none focus:border-[#b78c43]"><option value="all">Any road width</option>{NEPAL_ROAD_WIDTHS.map(item => <option key={item} value={item}>{item} ft or wider</option>)}</select></div>
      <div><label className="catalog-label" htmlFor="catalog-price">Price range</label><select id="catalog-price" value={price} onChange={event => setPrice(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#10243a]/15 bg-white px-3 text-sm outline-none focus:border-[#b78c43]">{priceOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
      <div><label className="catalog-label" htmlFor="catalog-sort">Sort properties</label><select id="catalog-sort" value={sort} onChange={event => setSort(event.target.value as PropertySort)} className="mt-2 h-11 w-full rounded-xl border border-[#10243a]/15 bg-white px-3 text-sm outline-none focus:border-[#b78c43]"><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="location">Location</option><option value="type">Property type</option></select></div>
      <button onClick={() => setOnlyFavorites(current => !current)} aria-pressed={onlyFavorites} className={`flex h-11 items-center justify-between rounded-xl border px-3 text-xs font-bold transition ${onlyFavorites ? "border-[#b78c43] bg-[#10243a] text-white" : "border-[#10243a]/15 bg-white text-[#10243a]"}`}>Saved properties only <span>{onlyFavorites ? "On" : "Off"}</span></button>
      {favoriteIds.length > 0 && <button onClick={clearFavorites} className="w-fit text-[11px] font-bold uppercase tracking-[.12em] text-rose-700 transition hover:text-rose-900">Clear {favoriteIds.length} saved {favoriteIds.length === 1 ? "property" : "properties"}</button>}
      <button onClick={clear} className="flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#9b783a] hover:text-[#10243a]"><X className="h-3.5 w-3.5" /> Clear filters</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f5ee] text-[#10243a]"><PublicHeader />
      <main id="main-content">
        <section className="bg-[#0a1b2f] py-16 text-white sm:py-20"><div className="container"><p className="eyebrow text-[#d7b16c]">Curated across Nepal</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-[.94] sm:text-6xl">Find the setting that <em className="font-light text-[#e5c37d]">fits your next chapter.</em></h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/65">Browse select homes, apartments, commercial spaces, and land opportunities with clear details before you enquire.</p></div></section>
        <section className="container py-8 lg:py-12"><div className="mb-7 flex items-center justify-between gap-4 lg:hidden"><p className="text-sm text-slate-500">{properties.length} properties found</p><button onClick={() => setDrawerOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#10243a] px-4 text-xs font-bold text-white"><SlidersHorizontal className="h-4 w-4" /> Filters</button></div>
          <div className="grid gap-9 lg:grid-cols-[264px_minmax(0,1fr)]"><aside className="hidden h-fit rounded-2xl border border-[#10243a]/10 bg-[#f1ecdf] p-6 lg:block"><div className="mb-6 flex items-center gap-2"><Filter className="h-4 w-4 text-[#9b783a]" /><p className="text-xs font-bold uppercase tracking-[.14em]">Refine search</p></div>{controls}</aside>
            <div><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><button onClick={saveCurrentSearch} className="inline-flex items-center gap-2 rounded-full border border-[#b78c43] bg-[#fbf8f0] px-4 py-2 text-[11px] font-bold uppercase tracking-[.1em] text-[#10243a] transition hover:bg-[#e9e4d8]"><Bookmark className="h-3.5 w-3.5" /> Save search</button>{savedSearches.length > 0 && <details className="relative"><summary className="cursor-pointer list-none rounded-full border border-[#10243a]/15 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[.1em]">Saved searches ({savedSearches.length})</summary><div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-[#10243a]/10 bg-white p-3 shadow-xl">{savedSearches.map(saved => <div key={saved.id} className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-[#f1ecdf]"><button onClick={() => loadSavedSearch(saved)} className="min-w-0 flex-1 truncate text-left text-xs font-semibold text-[#10243a]">{saved.label}</button><button aria-label={`Delete saved search ${saved.label}`} onClick={() => setSavedSearches(current => current.filter(item => item.id !== saved.id))} className="text-xs text-rose-700">Delete</button></div>)}</div></details>}</div>{compareIds.length > 0 && <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d7b16c]/45 bg-[#10243a] px-5 py-4 text-white"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#e5c37d]">Comparison workspace</p><p className="mt-1 text-sm text-white/70">{compareIds.length} of 3 listings selected{compareIds.length < 3 ? " — add another from the catalogue" : ""}.</p></div><div className="flex flex-wrap gap-3"><button onClick={() => navigate(`/wishlist?compare=${encodeURIComponent(compareIds.join(","))}`)} className="rounded-full bg-[#d7b16c] px-4 py-2 text-[11px] font-bold uppercase tracking-[.1em] text-[#10243a]">Compare side by side</button><button onClick={() => setCompareIds([])} className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[.1em] text-white">Clear</button></div></div>}<div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div className="hidden items-center gap-5 lg:flex"><p className="text-sm text-slate-500"><span className="font-semibold text-[#10243a]">{properties.length}</span> considered properties</p><p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Sorted by {sort.replace("-", " ")}</p></div><div className="flex rounded-full border border-[#10243a]/15 bg-white p-1" role="group" aria-label="Property catalogue view"><button onClick={() => setView("list")} aria-pressed={view === "list"} className={`flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[.08em] ${view === "list" ? "bg-[#10243a] text-white" : "text-[#10243a]/55"}`}><List className="h-3.5 w-3.5" /> List</button><button onClick={() => setView("map")} aria-pressed={view === "map"} className={`flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[.08em] ${view === "map" ? "bg-[#10243a] text-white" : "text-[#10243a]/55"}`}><MapPinned className="h-3.5 w-3.5" /> Map</button></div></div>{propertiesQuery.isLoading ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div className="h-[400px] animate-pulse rounded-[1.35rem] bg-[#e9e4d8]" key={index} />)}</div> : propertiesQuery.isError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-16 text-center"><p className="font-display text-3xl text-[#10243a]">The catalogue is temporarily unavailable.</p><p className="mt-3 text-sm text-slate-600">Please try again in a moment, or contact PropNexus directly.</p><button onClick={() => propertiesQuery.refetch()} className="mt-6 rounded-full bg-[#10243a] px-5 py-2.5 text-xs font-bold text-white">Try again</button></div> : properties.length ? view === "list" ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{properties.map(property => <PropertyCard key={property.id} property={property} compact onCompare={() => toggleCompare(property.id)} compareSelected={compareIds.includes(property.id)} compareDisabled={compareIds.length >= 3} />)}</div> : <div className="overflow-hidden rounded-[1.35rem] border border-[#10243a]/10 bg-white shadow-[0_20px_70px_rgba(16,36,58,.08)]"><MapView key={properties.map(item => item.id).join("-")} className="h-[520px]" initialCenter={getPropertyCoordinates(properties[0])} initialZoom={11} onMapReady={map => setupClusteredMarkers(map, properties, navigate, favoriteIds, toggleFavorite)} /><div className="grid gap-3 p-4 sm:grid-cols-3">{properties.slice(0, 6).map(property => <Link key={property.id} href={`/properties/${property.slug}`} className="rounded-xl border border-[#10243a]/10 p-3 transition hover:border-[#d7b16c]"><p className="text-xs font-bold text-[#10243a]">{property.title}</p><p className="mt-1 text-[11px] text-slate-500">{property.location}, {property.city}</p></Link>)}</div></div> : <div className="rounded-2xl border border-dashed border-[#10243a]/20 bg-white px-6 py-20 text-center"><p className="font-display text-3xl">No properties match this search.</p><p className="mt-3 text-sm text-slate-500">Try expanding the location, type, budget, or saved-property setting.</p><button onClick={clear} className="mt-6 rounded-full bg-[#10243a] px-5 py-2.5 text-xs font-bold text-white">Reset filters</button></div>}</div>
          </div></section>
        {drawerOpen && <div className="fixed inset-0 z-50 bg-[#071527]/55 p-4 lg:hidden"><div className="ml-auto h-full max-w-sm overflow-y-auto rounded-2xl bg-[#f8f5ee] p-6 shadow-2xl"><div className="mb-8 flex items-center justify-between"><p className="font-display text-2xl">Refine search</p><button onClick={() => setDrawerOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#e9e4d8]"><X className="h-4 w-4" /></button></div>{controls}<button onClick={() => setDrawerOpen(false)} className="mt-8 h-11 w-full rounded-xl bg-[#10243a] text-xs font-bold text-white">Show {properties.length} properties</button></div></div>}
      </main><PublicFooter />
    </div>
  );
}

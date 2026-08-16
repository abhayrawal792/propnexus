import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import PropertyCard from "@/components/PropertyCard";
import { Property, PropertySort, sortProperties } from "@/lib/property";
import { trpc } from "@/lib/trpc";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearch } from "wouter";
import { useFavorites } from "@/hooks/useFavorites";

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
  const [propertyType, setPropertyType] = useState<(typeof typeOptions)[number]>(() => typeOptions.includes(requestedType as (typeof typeOptions)[number]) ? requestedType as (typeof typeOptions)[number] : "All");
  const [listingType, setListingType] = useState<"All" | "Sale" | "Rent">(() => requestedListing === "Sale" || requestedListing === "Rent" ? requestedListing : "All");
  const [location, setLocation] = useState(() => initialSearch.get("location") ?? "");
  const [price, setPrice] = useState(() => priceOptions.some(option => option.value === requestedBudget) ? requestedBudget as string : "all");
  const [sort, setSort] = useState<PropertySort>(() => ["newest", "price-low", "price-high", "location", "type"].includes(initialSearch.get("sort") ?? "") ? initialSearch.get("sort") as PropertySort : "newest");
  const [onlyFavorites, setOnlyFavorites] = useState(() => initialSearch.get("favorites") === "1");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { favoriteIds, clearFavorites } = useFavorites();

  const filters = useMemo(() => ({
    propertyType: propertyType === "All" ? undefined : propertyType,
    listingType: listingType === "All" ? undefined : listingType,
    location: location || undefined,
    maxPrice: price === "all" || price === "999999999" ? undefined : Number(price),
    minPrice: price === "999999999" ? 30000001 : undefined,
  }), [propertyType, listingType, location, price]);
  const propertiesQuery = trpc.properties.list.useQuery(filters);
  const properties = useMemo(() => sortProperties(((propertiesQuery.data ?? []) as Property[]).filter(property => !onlyFavorites || favoriteIds.includes(property.id)), sort), [propertiesQuery.data, onlyFavorites, favoriteIds, sort]);

  const clear = () => { setPropertyType("All"); setListingType("All"); setLocation(""); setPrice("all"); setSort("newest"); setOnlyFavorites(false); };
  const controls = (
    <div className="grid gap-5">
      <div><label className="catalog-label">Property type</label><div className="mt-2 flex flex-wrap gap-2">{typeOptions.map(option => <button key={option} onClick={() => setPropertyType(option)} className={`rounded-full border px-3.5 py-2 text-[11px] font-bold transition ${propertyType === option ? "border-[#b78c43] bg-[#10243a] text-white" : "border-[#10243a]/15 bg-white text-[#10243a] hover:border-[#b78c43]"}`}>{option}</button>)}</div></div>
      <div><label className="catalog-label">Listing</label><div className="mt-2 grid grid-cols-2 rounded-xl bg-[#e9e4d8] p-1"><button onClick={() => setListingType("Sale")} className={`rounded-lg py-2 text-[11px] font-bold ${listingType === "Sale" ? "bg-[#10243a] text-white" : "text-slate-500"}`}>Buy</button><button onClick={() => setListingType("Rent")} className={`rounded-lg py-2 text-[11px] font-bold ${listingType === "Rent" ? "bg-[#10243a] text-white" : "text-slate-500"}`}>Rent</button></div></div>
      <div><label className="catalog-label" htmlFor="catalog-location">Location</label><div className="relative mt-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="catalog-location" value={location} onChange={event => setLocation(event.target.value)} placeholder="Kathmandu, Chitwan..." className="h-11 w-full rounded-xl border border-[#10243a]/15 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#b78c43]" /></div></div>
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
            <div><div className="mb-6 hidden items-center justify-between lg:flex"><p className="text-sm text-slate-500"><span className="font-semibold text-[#10243a]">{properties.length}</span> considered properties</p><p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Sorted by {sort.replace("-", " ")}</p></div>{propertiesQuery.isLoading ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div className="h-[400px] animate-pulse rounded-[1.35rem] bg-[#e9e4d8]" key={index} />)}</div> : propertiesQuery.isError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-16 text-center"><p className="font-display text-3xl text-[#10243a]">The catalogue is temporarily unavailable.</p><p className="mt-3 text-sm text-slate-600">Please try again in a moment, or contact PropNexus directly.</p><button onClick={() => propertiesQuery.refetch()} className="mt-6 rounded-full bg-[#10243a] px-5 py-2.5 text-xs font-bold text-white">Try again</button></div> : properties.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{properties.map(property => <PropertyCard key={property.id} property={property} compact />)}</div> : <div className="rounded-2xl border border-dashed border-[#10243a]/20 bg-white px-6 py-20 text-center"><p className="font-display text-3xl">No properties match this search.</p><p className="mt-3 text-sm text-slate-500">Try expanding the location, type, budget, or saved-property setting.</p><button onClick={clear} className="mt-6 rounded-full bg-[#10243a] px-5 py-2.5 text-xs font-bold text-white">Reset filters</button></div>}</div>
          </div></section>
        {drawerOpen && <div className="fixed inset-0 z-50 bg-[#071527]/55 p-4 lg:hidden"><div className="ml-auto h-full max-w-sm overflow-y-auto rounded-2xl bg-[#f8f5ee] p-6 shadow-2xl"><div className="mb-8 flex items-center justify-between"><p className="font-display text-2xl">Refine search</p><button onClick={() => setDrawerOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#e9e4d8]"><X className="h-4 w-4" /></button></div>{controls}<button onClick={() => setDrawerOpen(false)} className="mt-8 h-11 w-full rounded-xl bg-[#10243a] text-xs font-bold text-white">Show {properties.length} properties</button></div></div>}
      </main><PublicFooter />
    </div>
  );
}

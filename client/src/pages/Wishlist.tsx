import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import PropertyCard from "@/components/PropertyCard";
import { FAVORITES_CHANGE_EVENT, readFavoriteIds, saveFavoriteIds, useFavorites } from "@/hooks/useFavorites";
import { formatNpr, Property, sortProperties } from "@/lib/property";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, ClipboardCheck, Heart, Scale, Share2, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

type WishlistSort = "newest" | "oldest" | "price-low" | "price-high";
const priceFilters = [
  { label: "Any price", value: "all" },
  { label: "Under Rs. 1 crore", value: "10000000" },
  { label: "Under Rs. 3 crore", value: "30000000" },
  { label: "Above Rs. 3 crore", value: "above" },
] as const;

export default function Wishlist() {
  const { favoriteIds, clearFavorites } = useFavorites();
  const propertiesQuery = trpc.properties.list.useQuery();
  const [sort, setSort] = useState<WishlistSort>("newest");
  const [priceFilter, setPriceFilter] = useState<(typeof priceFilters)[number]["value"]>("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    const sharedIds = (new URLSearchParams(window.location.search).get("wishlist") ?? "").split(",").map(id => id.trim()).filter(Boolean);
    if (!sharedIds.length) return;
    saveFavoriteIds(window.localStorage, Array.from(new Set([...readFavoriteIds(window.localStorage), ...sharedIds])));
    window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
    window.history.replaceState({}, "", "/wishlist");
  }, []);

  async function shareWishlist() {
    if (!favoriteIds.length) return;
    const url = `${window.location.origin}/wishlist?wishlist=${encodeURIComponent(favoriteIds.join(","))}`;
    try { await navigator.clipboard.writeText(url); } catch { window.prompt("Copy your PropNexus wishlist link", url); }
    setShareStatus("copied");
    window.setTimeout(() => setShareStatus("idle"), 2200);
  }

  const savedProperties = ((propertiesQuery.data ?? []) as Property[]).filter(property => favoriteIds.includes(property.id));
  const properties = useMemo(() => {
    const filtered = savedProperties.filter(property => {
      if (priceFilter === "all") return true;
      if (priceFilter === "above") return property.price > 30000000;
      return property.price <= Number(priceFilter);
    });
    if (sort === "oldest") return [...filtered].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
    return sortProperties(filtered, sort === "newest" ? "newest" : sort);
  }, [savedProperties, priceFilter, sort]);
  const compareProperties = compareIds.map(id => savedProperties.find(property => property.id === id)).filter((property): property is Property => Boolean(property));

  function toggleCompare(propertyId: string) {
    setCompareIds(current => current.includes(propertyId) ? current.filter(id => id !== propertyId) : current.length < 3 ? [...current, propertyId] : current);
  }

  return (
    <div className="min-h-screen bg-[#f8f5ee] text-[#10243a]"><PublicHeader />
      <main id="main-content">
        <section className="bg-[#0a1b2f] py-16 text-white sm:py-20"><div className="container"><p className="eyebrow text-[#d7b16c]">Your private shortlist</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-[.94] sm:text-6xl">A place for the properties <em className="font-light text-[#e5c37d]">worth returning to.</em></h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/65">Organize saved properties by price, revisit the newest opportunities, and compare the ones that stand out.</p></div></section>
        <section className="container py-10 sm:py-14">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e9ddc4] text-[#8e6b32]"><Heart className="h-4 w-4 fill-current" /></span><p className="text-sm text-slate-500"><span className="font-semibold text-[#10243a]">{properties.length}</span> of {savedProperties.length} saved {savedProperties.length === 1 ? "property" : "properties"}</p></div><div className="flex flex-wrap items-center gap-3"><label className="sr-only" htmlFor="wishlist-price">Filter wishlist by price</label><select id="wishlist-price" value={priceFilter} onChange={event => setPriceFilter(event.target.value as typeof priceFilter)} className="h-10 rounded-xl border border-[#10243a]/15 bg-white px-3 text-xs font-semibold outline-none focus:border-[#b78c43]">{priceFilters.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><label className="sr-only" htmlFor="wishlist-sort">Sort wishlist</label><select id="wishlist-sort" value={sort} onChange={event => setSort(event.target.value as WishlistSort)} className="h-10 rounded-xl border border-[#10243a]/15 bg-white px-3 text-xs font-semibold outline-none focus:border-[#b78c43]"><option value="newest">Newest saved listings</option><option value="oldest">Oldest listings</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>{favoriteIds.length > 0 && <><button onClick={shareWishlist} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#8e6b32] transition hover:text-[#10243a]">{shareStatus === "copied" ? <ClipboardCheck className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />} {shareStatus === "copied" ? "Link copied" : "Share wishlist"}</button><button onClick={clearFavorites} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-rose-700 transition hover:text-rose-900"><Trash2 className="h-3.5 w-3.5" /> Clear wishlist</button></>}</div></div>
          {compareProperties.length > 0 && <section id="comparison-print-area" aria-labelledby="compare-title" className="mb-10 overflow-hidden rounded-2xl border border-[#d7b16c]/40 bg-[#0b1c2f] text-white shadow-[0_18px_55px_rgba(8,23,41,.14)]"><div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><Scale className="h-5 w-5 text-[#e5c37d]" /><div><h2 id="compare-title" className="font-display text-2xl">Compare saved properties</h2><p className="mt-1 text-xs text-white/55">{compareProperties.length} of 3 comparison slots used.</p></div></div><div className="flex flex-wrap items-center gap-4"><button onClick={() => window.print()} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#e5c37d] hover:text-white"><ClipboardCheck className="h-3.5 w-3.5" /> Export comparison PDF</button><button onClick={() => setCompareIds([])} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#e5c37d] hover:text-white"><X className="h-3.5 w-3.5" /> Clear comparison</button></div></div><div className="overflow-x-auto"><div className="grid min-w-[720px] grid-cols-3 divide-x divide-white/10">{compareProperties.map(property => <article key={property.id} className="p-5"><div className="relative overflow-hidden rounded-xl"><img src={property.featuredImage} alt={property.title} className="aspect-[4/3] w-full object-cover" /><button onClick={() => toggleCompare(property.id)} aria-label={`Remove ${property.title} from comparison`} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-[#081729]/80 text-white"><X className="h-3.5 w-3.5" /></button></div><h3 className="mt-4 font-display text-xl">{property.title}</h3><p className="mt-1 text-xs text-white/55">{property.location}, {property.city}</p><dl className="mt-5 grid gap-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-white/50">Price</dt><dd className="font-semibold text-[#e5c37d]">{formatNpr(property.price, property.listingType)}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">Type</dt><dd>{property.propertyType}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">Area</dt><dd>{property.areaSize}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">Bedrooms</dt><dd>{property.bedrooms || "—"}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/50">Status</dt><dd>{property.status}</dd></div></dl><Link href={`/properties/${property.slug}`} className="mt-5 inline-flex text-[10px] font-bold uppercase tracking-[.12em] text-[#e5c37d]">View details</Link></article>)}</div></div></section>}
          {propertiesQuery.isLoading ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[400px] animate-pulse rounded-[1.35rem] bg-[#e9e4d8]" />)}</div> : propertiesQuery.isError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-16 text-center"><p className="font-display text-3xl">Your wishlist is temporarily unavailable.</p><button onClick={() => propertiesQuery.refetch()} className="mt-6 rounded-full bg-[#10243a] px-5 py-2.5 text-xs font-bold text-white">Try again</button></div> : properties.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{properties.map(property => <article key={property.id} className="relative"><button onClick={() => toggleCompare(property.id)} aria-pressed={compareIds.includes(property.id)} className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[.08em] shadow-md transition ${compareIds.includes(property.id) ? "bg-[#d7b16c] text-[#10243a]" : "bg-[#081729]/85 text-white hover:bg-[#d7b16c] hover:text-[#10243a]"}`}><Check className={`h-3 w-3 ${compareIds.includes(property.id) ? "opacity-100" : "opacity-0"}`} /> Compare</button><PropertyCard property={property} compact /></article>)}</div> : <div className="rounded-2xl border border-dashed border-[#10243a]/20 bg-white px-6 py-20 text-center"><Heart className="mx-auto h-8 w-8 text-[#b78c43]" /><p className="mt-5 font-display text-3xl">{savedProperties.length ? "No saved properties match this price filter." : "Your wishlist is waiting."}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{savedProperties.length ? "Try another price range to bring a saved property back into view." : "Save a property from the catalogue or a detail page and it will appear here for later viewing."}</p><Link href="/properties" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#10243a] px-5 py-3 text-xs font-bold text-white"><ArrowLeft className="h-4 w-4" /> Explore properties</Link></div>}
        </section>
      </main><PublicFooter />
    </div>
  );
}

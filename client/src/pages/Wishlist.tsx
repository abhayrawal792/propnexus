import PublicFooter from "@/components/PublicFooter";
import PublicHeader from "@/components/PublicHeader";
import PropertyCard from "@/components/PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import { Property } from "@/lib/property";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Wishlist() {
  const { favoriteIds, clearFavorites } = useFavorites();
  const propertiesQuery = trpc.properties.list.useQuery();
  const properties = ((propertiesQuery.data ?? []) as Property[]).filter(property => favoriteIds.includes(property.id));

  return <div className="min-h-screen bg-[#f8f5ee] text-[#10243a]"><PublicHeader />
    <main id="main-content">
      <section className="bg-[#0a1b2f] py-16 text-white sm:py-20"><div className="container"><p className="eyebrow text-[#d7b16c]">Your private shortlist</p><h1 className="mt-4 max-w-3xl font-display text-5xl leading-[.94] sm:text-6xl">A place for the properties <em className="font-light text-[#e5c37d]">worth returning to.</em></h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/65">Your saved properties stay in this browser, ready for another look whenever you are ready.</p></div></section>
      <section className="container py-10 sm:py-14"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e9ddc4] text-[#8e6b32]"><Heart className="h-4 w-4 fill-current" /></span><p className="text-sm text-slate-500"><span className="font-semibold text-[#10243a]">{properties.length}</span> saved {properties.length === 1 ? "property" : "properties"}</p></div>{favoriteIds.length > 0 && <button onClick={clearFavorites} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-rose-700 transition hover:text-rose-900"><Trash2 className="h-3.5 w-3.5" /> Clear wishlist</button>}</div>
        {propertiesQuery.isLoading ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-[400px] animate-pulse rounded-[1.35rem] bg-[#e9e4d8]" />)}</div> : propertiesQuery.isError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-16 text-center"><p className="font-display text-3xl">Your wishlist is temporarily unavailable.</p><button onClick={() => propertiesQuery.refetch()} className="mt-6 rounded-full bg-[#10243a] px-5 py-2.5 text-xs font-bold text-white">Try again</button></div> : properties.length ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{properties.map(property => <PropertyCard key={property.id} property={property} compact />)}</div> : <div className="rounded-2xl border border-dashed border-[#10243a]/20 bg-white px-6 py-20 text-center"><Heart className="mx-auto h-8 w-8 text-[#b78c43]" /><p className="mt-5 font-display text-3xl">Your wishlist is waiting.</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Save a property from the catalogue or a detail page and it will appear here for later viewing.</p><Link href="/properties" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#10243a] px-5 py-3 text-xs font-bold text-white"><ArrowLeft className="h-4 w-4" /> Explore properties</Link></div>}
      </section>
    </main><PublicFooter />
  </div>;
}

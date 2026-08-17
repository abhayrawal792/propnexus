import { Bath, BedDouble, Heart, MapPin, MoveUpRight, Ruler, Scale } from "lucide-react";
import { Link } from "wouter";
import { formatNpr, Property, propertyStatusClass } from "@/lib/property";
import { useFavorites } from "@/hooks/useFavorites";

type PropertyCardProps = { property: Property; compact?: boolean; readOnly?: boolean; onCompare?: (property: Property) => void; compareSelected?: boolean; compareDisabled?: boolean };

export default function PropertyCard({ property, compact = false, readOnly = false, onCompare, compareSelected = false, compareDisabled = false }: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(property.id);
  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-slate-900/8 bg-[#f8f5ee] shadow-[0_18px_48px_rgba(8,23,41,.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_64px_rgba(8,23,41,.15)]">
      <div className="relative overflow-hidden bg-[#0b1b2f]">
        <Link href={`/properties/${property.slug}`} className="block">
          <img src={property.featuredImage} alt={property.title} className={`w-full object-cover transition duration-700 group-hover:scale-[1.045] ${compact ? "aspect-[4/3]" : "aspect-[1.26]"}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081729]/50 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex gap-2">
            {property.featured && <span className="rounded-full bg-[#f8f0de] px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#12243a]">Featured</span>}
            <span className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] ${propertyStatusClass(property.status)}`}>{property.status}</span>
          </div>
          <span className="absolute bottom-4 left-4 rounded-full bg-[#081729]/80 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur">For {property.listingType}</span>
        </Link>
        {!readOnly && <button onClick={() => toggleFavorite(property.id)} aria-pressed={saved} aria-label={`${saved ? "Remove" : "Save"} ${property.title} ${saved ? "from" : "to"} favorites`} className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${saved ? "bg-[#d7b16c] text-[#10243a]" : "bg-[#081729]/75 text-white hover:bg-[#f8f0de] hover:text-[#10243a]"}`}><Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /></button>}
      </div>
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#99712e]">{property.propertyType}</span><span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{property.location}</span></div>
        <Link href={`/properties/${property.slug}`} className="block font-display text-[1.45rem] leading-tight text-[#10243a] transition hover:text-[#99712e]">{property.title}</Link>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500">{property.areaSize} <span className="mx-1.5 text-slate-300">/</span> {property.city}</p>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#0c1c2e]/10 pt-4">
          <div>
            <p className="font-display text-xl text-[#10243a]">{formatNpr(property.price, property.listingType)}</p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
              {property.bedrooms > 0 && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-[#a57c34]" />{property.bedrooms} Beds</span>}
              {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-[#a57c34]" />{property.bathrooms} Baths</span>}
              <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5 text-[#a57c34]" />{property.areaSize}</span>
            </div>
          </div>
          <Link href={`/properties/${property.slug}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#10243a] text-white transition hover:bg-[#c49a4b] hover:text-[#10243a]" aria-label={`View ${property.title}`}><MoveUpRight className="h-4 w-4" /></Link>
        </div>
        {onCompare && <button type="button" onClick={() => onCompare(property)} disabled={compareDisabled && !compareSelected} aria-pressed={compareSelected} className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] transition ${compareSelected ? "border-[#d7b16c] bg-[#10243a] text-[#f0ce89]" : "border-[#10243a]/15 text-[#10243a] hover:border-[#d7b16c]"} disabled:cursor-not-allowed disabled:opacity-45`}><Scale className="h-3.5 w-3.5" /> {compareSelected ? "Selected for compare" : compareDisabled ? "Compare limit reached" : "Compare"}</button>}
      </div>
    </article>
  );
}

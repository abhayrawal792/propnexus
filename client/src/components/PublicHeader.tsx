import { Heart, Menu, Phone, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";

const LOGO_URL = "/manus-storage/propnexus-logo-clean_2e81583e.png";
const WHATSAPP_URL = "https://wa.me/9779769279600?text=Hello%20Abhay%2C%20I%20would%20like%20to%20enquire%20about%20a%20PropNexus%20property.";

export default function PublicHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { favoriteCount } = useFavorites();

  const active = (path: string) => location === path;

  return (
    <header className="relative z-50 border-b border-white/10 bg-[#081729]/96 text-white backdrop-blur-xl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-[#d7b16c] focus:px-3 focus:py-2 focus:text-xs focus:font-bold focus:text-[#081729]">Skip to main content</a>
      <div className="container flex h-20 items-center justify-between gap-5">
        <Link href="/" className="group flex min-w-0 items-center" aria-label="PropNexus home"><img src={LOGO_URL} alt="PropNexus Property & Real Estate" className="h-auto w-[148px] object-contain sm:w-[176px]" /></Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          <Link href="/" className={`text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${active("/") ? "text-[#d7b16c]" : "text-white/70 hover:text-white"}`}>Discover</Link>
          <Link href="/properties" className={`text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${active("/properties") ? "text-[#d7b16c]" : "text-white/70 hover:text-white"}`}>Properties</Link>
          <a href="#why-propnexus" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white">Why PropNexus</a>
          <a href="#contact" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/properties" className="hidden h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-semibold text-white transition hover:border-[#d7b16c] hover:text-[#e5c37d] sm:flex">
            <Search className="h-3.5 w-3.5" /> Search
          </Link>
          <Link href="/properties?favorites=1" className="hidden h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs font-semibold text-white transition hover:border-[#d7b16c] hover:text-[#e5c37d] md:flex" aria-label="View saved properties"><Heart className="h-3.5 w-3.5" />{favoriteCount ? favoriteCount : "Saved"}</Link>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hidden h-10 items-center gap-2 rounded-full bg-[#d7b16c] px-4 text-xs font-bold text-[#071527] transition hover:-translate-y-0.5 hover:bg-[#ebcb87] sm:flex">
            <Phone className="h-3.5 w-3.5" /> Contact Abhay
          </a>
          <button onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition hover:border-[#d7b16c] lg:hidden" aria-label="Open navigation menu" aria-expanded={menuOpen}><Menu className="h-4 w-4" /></button>
        </div>
      </div>
      {menuOpen && <div className="fixed inset-0 z-50 bg-[#071527]/75 p-4 lg:hidden"><div className="ml-auto flex h-full max-w-sm flex-col rounded-2xl border border-white/10 bg-[#0b1c2f] p-6 shadow-2xl"><div className="flex items-center justify-between"><img src={LOGO_URL} alt="PropNexus Property & Real Estate" className="h-auto w-40 object-contain" /><button onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15" aria-label="Close navigation menu"><X className="h-4 w-4" /></button></div><nav className="mt-10 grid gap-2" aria-label="Mobile navigation"><Link onClick={() => setMenuOpen(false)} href="/" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Discover</Link><Link onClick={() => setMenuOpen(false)} href="/properties" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Browse properties</Link><Link onClick={() => setMenuOpen(false)} href="/properties?favorites=1" className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Saved properties <span className="rounded-full bg-[#d7b16c] px-2 py-0.5 text-[10px] text-[#10243a]">{favoriteCount}</span></Link><a onClick={() => setMenuOpen(false)} href="/#why-propnexus" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Why PropNexus</a><a onClick={() => setMenuOpen(false)} href="/#contact" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Contact</a></nav><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-auto flex h-12 items-center justify-center gap-2 rounded-xl bg-[#d7b16c] text-xs font-bold text-[#071527]"><Phone className="h-4 w-4" /> Contact Abhay</a></div></div>}
    </header>
  );
}

export const propNexusWhatsAppUrl = WHATSAPP_URL;

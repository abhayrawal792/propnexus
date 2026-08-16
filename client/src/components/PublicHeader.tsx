import { Menu, Phone, Search } from "lucide-react";
import { Link, useLocation } from "wouter";

const LOGO_URL = "/manus-storage/propnexus-logo_d2771ed4.webp";
const WHATSAPP_URL = "https://wa.me/9779769279600?text=Hello%20Abhay%2C%20I%20would%20like%20to%20enquire%20about%20a%20PropNexus%20property.";

export default function PublicHeader() {
  const [location] = useLocation();

  const active = (path: string) => location === path;

  return (
    <header className="border-b border-white/10 bg-[#081729]/96 text-white backdrop-blur-xl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-[#d7b16c] focus:px-3 focus:py-2 focus:text-xs focus:font-bold focus:text-[#081729]">Skip to main content</a>
      <div className="container flex h-20 items-center justify-between gap-5">
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="PropNexus home">
          <img src={LOGO_URL} alt="PropNexus Property & Real Estate" className="h-12 w-[100px] rounded-sm object-cover object-center shadow-[0_8px_24px_rgba(0,0,0,.22)] sm:h-14 sm:w-[126px]" />
          <div className="hidden min-w-0 sm:block">
            <p className="font-display text-xl leading-none text-[#f8f0de]">PropNexus</p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7b16c]">Property & Real Estate</p>
          </div>
        </Link>

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
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hidden h-10 items-center gap-2 rounded-full bg-[#d7b16c] px-4 text-xs font-bold text-[#071527] transition hover:-translate-y-0.5 hover:bg-[#ebcb87] sm:flex">
            <Phone className="h-3.5 w-3.5" /> Contact Abhay
          </a>
          <Link href="/properties" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white lg:hidden" aria-label="Browse properties"><Menu className="h-4 w-4" /></Link>
        </div>
      </div>
    </header>
  );
}

export const propNexusWhatsAppUrl = WHATSAPP_URL;

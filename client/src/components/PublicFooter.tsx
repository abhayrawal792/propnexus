import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";

const LOGO_URL = "/manus-storage/propnexus-logo_660454fb.webp";

export default function PublicFooter() {
  return (
    <footer id="contact" className="bg-[#071527] text-white">
      <div className="container grid gap-12 py-16 lg:grid-cols-[1.35fr_.8fr_.9fr] lg:py-20">
        <div>
          <div className="flex items-center"><img src={LOGO_URL} alt="PropNexus Property & Real Estate" className="h-auto w-[190px] object-contain" /></div>
          <p className="mt-7 max-w-md text-sm leading-7 text-white/60">Considered real estate guidance for Nepal’s buyers, sellers, and tenants. Every property conversation begins with clarity and local knowledge.</p>
          <a href="https://wa.me/9779769279600" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#e6c27a] transition hover:text-white">Start a conversation <ArrowUpRight className="h-4 w-4" /></a>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d7b16c]">Explore</p>
          <div className="mt-5 grid gap-3 text-sm text-white/70"><Link href="/" className="hover:text-white">Discover</Link><Link href="/properties" className="hover:text-white">Property catalogue</Link><Link href="/admin" className="hover:text-white">Owner administration</Link></div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#d7b16c]">Contact</p>
          <div className="mt-5 grid gap-4 text-sm text-white/70"><a className="flex items-center gap-3 hover:text-white" href="tel:+9779769279600"><Phone className="h-4 w-4 text-[#d7b16c]" />+977 9769279600</a><a className="flex items-center gap-3 hover:text-white" href="mailto:rawalabhaya!@gmail.com"><Mail className="h-4 w-4 text-[#d7b16c]" />rawalabhaya!@gmail.com</a><p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#d7b16c]" />Kathmandu, Nepal</p></div>
        </div>
      </div>
      <div className="border-t border-white/10"><div className="container flex flex-col gap-3 py-5 text-[10px] font-medium uppercase tracking-[.13em] text-white/35 sm:flex-row sm:justify-between"><span>© {new Date().getFullYear()} PropNexus</span><span>Property & Real Estate · Nepal</span></div></div>
    </footer>
  );
}

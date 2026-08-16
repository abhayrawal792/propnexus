import { Heart, Menu, Phone, Search, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { FormEvent, useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";

const LOGO_URL = "/manus-storage/propnexus-logo-clean_2e81583e.png";
const WHATSAPP_NUMBER = "9779769279600";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Abhay%2C%20I%20would%20like%20to%20enquire%20about%20a%20PropNexus%20property.`;

function ContactAbhayModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = `Hello Abhay, my name is ${String(form.get("name") ?? "")}. Phone: ${String(form.get("phone") ?? "")}. Email: ${String(form.get("email") ?? "")}. ${String(form.get("message") ?? "")}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[#071527]/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="contact-abhay-title">
      <div className="w-full max-w-lg rounded-3xl border border-[#d7b16c]/30 bg-[#0b1c2f] p-6 text-white shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-6">
          <div><p className="eyebrow text-[#e5c37d]">Private conversation</p><h2 id="contact-abhay-title" className="mt-3 font-display text-3xl">Contact Abhay</h2><p className="mt-2 text-sm leading-6 text-white/65">Tell us what you are looking for and we will continue the conversation on WhatsApp.</p></div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white transition hover:border-[#d7b16c]" aria-label="Close contact form"><X className="h-4 w-4" /></button>
        </div>
        {submitted ? (
          <div className="mt-8 rounded-2xl border border-[#d7b16c]/30 bg-[#102b43] p-6"><p className="font-display text-2xl">Your conversation is ready.</p><p className="mt-2 text-sm leading-6 text-white/70">WhatsApp should open with your details prepared for Abhay. You can close this window whenever you are ready.</p><button onClick={onClose} className="mt-5 rounded-full bg-[#d7b16c] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#071527]">Close</button></div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-semibold text-white/75">Name<input required name="name" className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#d7b16c]" placeholder="Your name" /></label><label className="grid gap-2 text-xs font-semibold text-white/75">Phone<input required name="phone" type="tel" className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#d7b16c]" placeholder="+977 ..." /></label></div>
            <label className="grid gap-2 text-xs font-semibold text-white/75">Email <span className="font-normal text-white/45">optional</span><input name="email" type="email" className="h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#d7b16c]" placeholder="you@example.com" /></label>
            <label className="grid gap-2 text-xs font-semibold text-white/75">What are you looking for?<textarea required name="message" rows={4} className="resize-none rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-[#d7b16c]" placeholder="Tell Abhay about your preferred location, property type, or budget." /></label>
            <button type="submit" className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#d7b16c] text-xs font-bold uppercase tracking-[.13em] text-[#071527] transition hover:bg-[#f0ce89]"><Phone className="h-4 w-4" /> Continue on WhatsApp</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PublicHeader() {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { favoriteCount } = useFavorites();

  useEffect(() => {
    document.body.style.overflow = menuOpen || contactOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, contactOpen]);

  const active = (path: string) => location === path;

  function navigateSection(hash: string) {
    setMenuOpen(false);
    if (window.location.pathname === "/") {
      const scrollToSection = () => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(scrollToSection, 80);
      window.setTimeout(scrollToSection, 650);
    } else {
      setLocation(`/${hash}`);
    }
  }

  return (
    <>
      <header className="relative z-50 border-b border-white/10 bg-[#081729]/96 text-white backdrop-blur-xl">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-[#d7b16c] focus:px-3 focus:py-2 focus:text-xs focus:font-bold focus:text-[#081729]">Skip to main content</a>
        <div className="container flex h-20 items-center justify-between gap-5">
          <Link href="/" className="group flex min-w-0 items-center" aria-label="PropNexus home"><img src={LOGO_URL} alt="PropNexus Property & Real Estate" className="h-auto w-[148px] object-contain sm:w-[176px]" /></Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation"><Link href="/" className={`text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${active("/") ? "text-[#d7b16c]" : "text-white/70 hover:text-white"}`}>Discover</Link><Link href="/properties" className={`text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${active("/properties") ? "text-[#d7b16c]" : "text-white/70 hover:text-white"}`}>Properties</Link><a href="/#why-propnexus" onClick={(event) => { if (window.location.pathname === "/") { event.preventDefault(); navigateSection("#why-propnexus"); } }} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white">Why PropNexus</a><a href="/#contact" onClick={(event) => { if (window.location.pathname === "/") { event.preventDefault(); navigateSection("#contact"); } }} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 transition-colors hover:text-white">Contact</a></nav>
          <div className="flex items-center gap-2"><Link href="/properties" className="hidden h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-semibold text-white transition hover:border-[#d7b16c] hover:text-[#e5c37d] sm:flex"><Search className="h-3.5 w-3.5" /> Search</Link><Link href="/wishlist" className="hidden h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs font-semibold text-white transition hover:border-[#d7b16c] hover:text-[#e5c37d] md:flex" aria-label="View wishlist"><Heart className="h-3.5 w-3.5" />{favoriteCount ? favoriteCount : "Saved"}</Link><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hidden h-10 items-center gap-2 rounded-full bg-[#d7b16c] px-4 text-xs font-bold text-[#071527] transition hover:-translate-y-0.5 hover:bg-[#ebcb87] sm:flex"><Phone className="h-3.5 w-3.5" /> Contact Abhay</a><button onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition hover:border-[#d7b16c] lg:hidden" aria-label="Open navigation menu" aria-expanded={menuOpen}><Menu className="h-4 w-4" /></button></div>
        </div>
        {menuOpen && <div className="fixed inset-0 z-[60] h-screen w-screen bg-[#071527] p-4 lg:hidden" style={{ backgroundColor: "#071527" }}><div className="ml-auto flex h-full w-full max-w-sm flex-col rounded-2xl border border-[#d7b16c]/30 bg-[#0b1c2f] p-6 shadow-2xl" style={{ backgroundColor: "#0b1c2f" }}><div className="flex items-center justify-between"><img src={LOGO_URL} alt="PropNexus Property & Real Estate" className="h-auto w-40 object-contain" /><button onClick={() => setMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15" aria-label="Close navigation menu"><X className="h-4 w-4" /></button></div><nav className="mt-10 grid gap-2" aria-label="Mobile navigation"><Link onClick={() => setMenuOpen(false)} href="/" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Discover</Link><Link onClick={() => setMenuOpen(false)} href="/properties" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Browse properties</Link><Link onClick={() => setMenuOpen(false)} href="/wishlist" className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Wishlist <span className="rounded-full bg-[#d7b16c] px-2 py-0.5 text-[10px] text-[#10243a]">{favoriteCount}</span></Link><a onClick={(event) => { event.preventDefault(); navigateSection("#why-propnexus"); }} href="/#why-propnexus" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Why PropNexus</a><a onClick={(event) => { event.preventDefault(); navigateSection("#contact"); }} href="/#contact" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white/10">Contact</a></nav><button onClick={() => { setMenuOpen(false); setContactOpen(true); }} className="mt-auto flex h-12 items-center justify-center gap-2 rounded-xl bg-[#d7b16c] text-xs font-bold text-[#071527]"><Phone className="h-4 w-4" /> Contact Abhay</button></div></div>}
      </header>
      {contactOpen && <ContactAbhayModal onClose={() => setContactOpen(false)} />}
    </>
  );
}

export const propNexusWhatsAppUrl = WHATSAPP_URL;

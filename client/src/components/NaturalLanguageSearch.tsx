import PropertyCard from "@/components/PropertyCard";
import { trpc } from "@/lib/trpc";
import { addQueryToHistory, AI_QUERY_HISTORY_KEY, GUIDED_SEARCH_EXAMPLES, parseQueryHistory, serializeQueryHistory } from "@/lib/discovery";
import { ArrowRight, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function NaturalLanguageSearch() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [queryHistory, setQueryHistory] = useState<string[]>(() => parseQueryHistory(localStorage.getItem(AI_QUERY_HISTORY_KEY)));
  const search = trpc.properties.naturalLanguageSearch.useMutation();
  useEffect(() => { localStorage.setItem(AI_QUERY_HISTORY_KEY, serializeQueryHistory(queryHistory)); }, [queryHistory]);
  const exampleQueries = GUIDED_SEARCH_EXAMPLES;

  function runQuery(nextQuery: string) {
    const normalized = nextQuery.trim();
    if (normalized.length < 3) return;
    setQuery(normalized);
    setQueryHistory(current => addQueryToHistory(current, normalized));
    search.mutate({ query: normalized });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runQuery(query);
  }

  function runExample(example: string) {
    runQuery(example);
  }

  function openCatalogue() {
    const intent = search.data?.intent;
    const params = new URLSearchParams();
    if (intent?.propertyType) params.set("type", intent.propertyType);
    if (intent?.listingType) params.set("listing", intent.listingType);
    if (intent?.location) params.set("location", intent.location);
    if (intent?.municipality) params.set("municipality", intent.municipality);
    if (intent?.ward) params.set("ward", String(intent.ward));
    if (intent?.minRoadWidth) params.set("roadWidth", String(intent.minRoadWidth));
    if (intent?.maxPrice) params.set("max", String(intent.maxPrice));
    setLocation(`/properties${params.size ? `?${params.toString()}` : ""}`);
  }

  const intent = search.data?.intent;
  const chips = [intent?.propertyType, intent?.listingType, intent?.location, intent?.municipality, intent?.ward ? `Ward ${intent.ward}` : null, intent?.minRoadWidth ? `${intent.minRoadWidth} ft road+` : null, intent?.maxPrice ? `Under Rs. ${(intent.maxPrice / 10000000).toFixed(1)} crore` : null].filter(Boolean);

  return <section aria-labelledby="natural-search-title" className="border-y border-[#d7b16c]/25 bg-[#10243a] py-8 text-white sm:py-10"><div className="container"><div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><div className="flex items-center gap-2 text-[#e5c37d]"><Sparkles className="h-4 w-4" /><p className="eyebrow">Conversational discovery</p></div><h2 id="natural-search-title" className="mt-3 font-display text-3xl sm:text-4xl">Tell us what you are looking for.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-white/65">Try “a three-bedroom house in Lalitpur under 3 crore with a 16 ft road”.</p></div><div><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="natural-property-search">Describe your ideal property</label><input id="natural-property-search" value={query} onChange={event => setQuery(event.target.value.slice(0, 500))} placeholder="Describe your ideal property in plain language..." className="h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#d7b16c]" /><button type="submit" disabled={search.isPending || query.trim().length < 3} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#d7b16c] px-5 text-xs font-extrabold uppercase tracking-[.12em] text-[#10243a] transition hover:bg-[#f0ce89] disabled:cursor-not-allowed disabled:opacity-60">{search.isPending ? "Interpreting…" : "Find matches"}<ArrowRight className="h-4 w-4" /></button></form><div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Example property searches"><span className="self-center text-[10px] font-bold uppercase tracking-[.1em] text-white/40">Try</span>{exampleQueries.map(example => <button key={example} type="button" onClick={() => runExample(example)} className="rounded-full border border-white/15 px-3 py-1.5 text-left text-[11px] text-white/70 transition hover:border-[#d7b16c] hover:text-[#f0ce89]">{example}</button>)}</div>{queryHistory.length > 0 && <details className="relative mt-3"><summary className="cursor-pointer list-none text-[11px] font-bold uppercase tracking-[.1em] text-white/55 hover:text-[#f0ce89]">Recent searches ({queryHistory.length})</summary><div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-white/15 bg-[#17304b] p-2 shadow-xl">{queryHistory.map(item => <button key={item} type="button" onClick={() => runQuery(item)} className="block w-full truncate rounded-lg px-3 py-2 text-left text-xs text-white/80 hover:bg-white/10">{item}</button>)}<button type="button" onClick={() => setQueryHistory([])} className="mt-1 w-full border-t border-white/10 px-3 pt-2 text-left text-[10px] font-bold uppercase tracking-[.1em] text-rose-200">Clear history</button></div></details>}
{search.isPending && <div className="mt-3 flex items-center gap-2 text-xs text-[#f0ce89]" role="status" aria-live="polite"><span>Reading your brief</span><span className="flex gap-1" aria-hidden="true"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#f0ce89] [animation-delay:-.2s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#f0ce89] [animation-delay:-.1s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#f0ce89]" /></span></div>}{search.isError && <p role="alert" className="mt-3 text-xs text-rose-200">Natural search is temporarily unavailable. Try the catalogue filters instead.</p>}{search.data && <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-white/80">{intent?.summary}</p>{chips.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{chips.map(chip => <span key={chip} className="rounded-full bg-[#d7b16c]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#f0ce89]">{chip}</span>)}</div>}<div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-white/55">{search.data.properties.length} matching listing{search.data.properties.length === 1 ? "" : "s"}</p><button type="button" onClick={openCatalogue} className="text-xs font-bold uppercase tracking-[.1em] text-[#e5c37d] hover:text-white">Open filtered catalogue</button></div>{search.data.properties.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-3">{search.data.properties.slice(0, 3).map(property => <PropertyCard key={property.id} property={property} compact />)}</div>}{search.data.properties.length === 0 && <p className="mt-4 text-sm text-white/60">No listings match all of those details yet. Try a broader location or road width.</p>}</div>}</div></div></div></section>;
}

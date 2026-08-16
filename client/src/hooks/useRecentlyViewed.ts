import { useCallback, useEffect, useMemo, useState } from "react";

export const RECENTLY_VIEWED_STORAGE_KEY = "propnexus-recently-viewed-property-ids";
const RECENTLY_VIEWED_EVENT = "propnexus-recently-viewed-changed";
const MAX_RECENTLY_VIEWED = 6;

export type RecentlyViewedEntry = { id: string; viewedAt: number };

function readEntries(): RecentlyViewedEntry[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(item => typeof item === "string" ? { id: item, viewedAt: Date.now() } : item).filter((item): item is RecentlyViewedEntry => Boolean(item) && typeof item.id === "string" && typeof item.viewedAt === "number").slice(0, MAX_RECENTLY_VIEWED);
  } catch {
    return [];
  }
}

function writeEntries(entries: RecentlyViewedEntry[]) {
  window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT));
}

export function useRecentlyViewed() {
  const [recentlyViewedEntries, setRecentlyViewedEntries] = useState<RecentlyViewedEntry[]>(() => readEntries());
  useEffect(() => {
    const sync = () => setRecentlyViewedEntries(readEntries());
    window.addEventListener("storage", sync);
    window.addEventListener(RECENTLY_VIEWED_EVENT, sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener(RECENTLY_VIEWED_EVENT, sync); };
  }, []);
  const addRecentlyViewed = useCallback((propertyId: string) => {
    const next = [{ id: propertyId, viewedAt: Date.now() }, ...readEntries().filter(entry => entry.id !== propertyId)].slice(0, MAX_RECENTLY_VIEWED);
    writeEntries(next);
    setRecentlyViewedEntries(next);
  }, []);
  const clearRecentlyViewed = useCallback(() => {
    window.localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT));
    setRecentlyViewedEntries([]);
  }, []);
  return useMemo(() => ({ recentlyViewedEntries, recentlyViewedIds: recentlyViewedEntries.map(entry => entry.id), addRecentlyViewed, clearRecentlyViewed }), [recentlyViewedEntries, addRecentlyViewed, clearRecentlyViewed]);
}

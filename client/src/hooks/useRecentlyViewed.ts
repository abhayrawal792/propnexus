import { useCallback, useEffect, useState } from "react";

export const RECENTLY_VIEWED_STORAGE_KEY = "propnexus-recently-viewed-property-ids";
const RECENTLY_VIEWED_EVENT = "propnexus-recently-viewed-changed";
const MAX_RECENTLY_VIEWED = 6;

function readIds(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string").slice(0, MAX_RECENTLY_VIEWED) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  window.localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT));
}

export function useRecentlyViewed() {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => readIds());
  useEffect(() => {
    const sync = () => setRecentlyViewedIds(readIds());
    window.addEventListener("storage", sync);
    window.addEventListener(RECENTLY_VIEWED_EVENT, sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener(RECENTLY_VIEWED_EVENT, sync); };
  }, []);
  const addRecentlyViewed = useCallback((propertyId: string) => {
    const next = [propertyId, ...readIds().filter(id => id !== propertyId)].slice(0, MAX_RECENTLY_VIEWED);
    writeIds(next);
    setRecentlyViewedIds(next);
  }, []);
  return { recentlyViewedIds, addRecentlyViewed };
}

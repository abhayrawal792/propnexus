import { useCallback, useEffect, useMemo, useState } from "react";

export const FAVORITES_STORAGE_KEY = "propnexus-saved-property-ids";
const CHANGE_EVENT = "propnexus-favorites-change";

export function parseFavoriteIds(value: string | null) {
  try {
    const saved = JSON.parse(value ?? "[]");
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [] as string[];
  }
}

export function readFavoriteIds(storage: Pick<Storage, "getItem">) {
  return parseFavoriteIds(storage.getItem(FAVORITES_STORAGE_KEY));
}

export function saveFavoriteIds(storage: Pick<Storage, "setItem">, ids: string[]) {
  storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

function readFavorites() {
  if (typeof window === "undefined") return [] as string[];
  return readFavoriteIds(window.localStorage);
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(readFavorites);

  useEffect(() => {
    const sync = () => setFavoriteIds(readFavorites());
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavoriteIds(current => {
      const next = current.includes(propertyId) ? current.filter(id => id !== propertyId) : [...current, propertyId];
      saveFavoriteIds(window.localStorage, next);
      window.dispatchEvent(new Event(CHANGE_EVENT));
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    setFavoriteIds([]);
  }, []);

  const isFavorite = useCallback((propertyId: string) => favoriteIds.includes(propertyId), [favoriteIds]);
  return useMemo(() => ({ favoriteIds, favoriteCount: favoriteIds.length, isFavorite, toggleFavorite, clearFavorites }), [favoriteIds, isFavorite, toggleFavorite, clearFavorites]);
}

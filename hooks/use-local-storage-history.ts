"use client";

import { useState, useEffect, useCallback } from "react";

export function useLocalStorageHistory(key: string, limit: number = 5) {
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setHistory(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Save history to localStorage on change
  useEffect(() => {
    // Only save if we have loaded existing history (to avoid overwriting with empty state)
    if (!isLoaded) return;

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(history));
      }
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [history, key, isLoaded]);

  const addToHistory = useCallback((value: string) => {
    if (!value || !value.trim()) return;
    const trimmedValue = value.trim();

    setHistory((prev) => {
      // Remove duplicates
      const filtered = prev.filter((item) => item !== trimmedValue);
      // Add to front
      const updated = [trimmedValue, ...filtered].slice(0, limit);
      return updated;
    });
  }, [limit]);

  return { history, addToHistory };
}

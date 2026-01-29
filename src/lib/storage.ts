import { SavedResult, EditorialResult, UserPreferences } from "./types";

const STORAGE_KEY = "editorial_drop_history";
const MAX_ITEMS = 5;

export function saveResult(result: EditorialResult, preferences: UserPreferences): string {
  const id = crypto.randomUUID();
  const savedResult: SavedResult = {
    id,
    timestamp: Date.now(),
    result,
    preferences,
  };

  const existing = getHistory();
  const updated = [savedResult, ...existing].slice(0, MAX_ITEMS);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }

  return id;
}

export function getHistory(): SavedResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as SavedResult[];
  } catch (e) {
    console.error("Failed to read from localStorage:", e);
    return [];
  }
}

export function getResultById(id: string): SavedResult | null {
  const history = getHistory();
  return history.find((item) => item.id === id) || null;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear localStorage:", e);
  }
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

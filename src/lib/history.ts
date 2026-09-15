/**
 * src/lib/history.ts — Local Privacy-Preserving Tool History Utility
 * Stores ONLY metadata (tool name, filename, timestamp, size savings) in localStorage.
 * ZERO file content, ZERO network requests.
 */

export interface HistoryItem {
  id: string;
  toolName: string;
  toolUrl: string;
  filename: string;
  timestamp: string;
  summary?: string;
}

const STORAGE_KEY = 'fft_recent_history';
const MAX_ITEMS = 10;

export function getRecentHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentHistory();
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Filter duplicate entries for the same tool & filename
    const filtered = current.filter((i) => !(i.toolUrl === item.toolUrl && i.filename === item.filename));
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch event so UI widgets update live
    window.dispatchEvent(new CustomEvent('fft:history_updated'));
  } catch (e) {}
}

export function clearRecentHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('fft:history_updated'));
  } catch (e) {}
}

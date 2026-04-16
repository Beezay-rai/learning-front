// lib/networkLogStore.ts
// Global singleton store that captures all API calls made via ApiClient (axios).
// The Diagnose → Network Logs page reads from this store.

export interface NetworkLogEntry {
  id: string;
  /** Which ApiClient instance made this call (e.g. "coreApi", "idsrvApi") */
  source: string;
  method: string;
  url: string;
  fullUrl: string;
  status: number | null;
  statusText: string;
  startTime: number;
  endTime: number | null;
  duration: number | null;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody: unknown;
  responseBody: unknown;
  error: string | null;
  pending: boolean;
  size: number | null;
}

type Listener = () => void;

let _entries: NetworkLogEntry[] = [];
let _idCounter = 0;
let _listeners: Set<Listener> = new Set();
let _maxEntries = 500;

function notify() {
  _listeners.forEach((fn) => fn());
}

export const networkLogStore = {
  /** Subscribe to store changes — returns an unsubscribe fn */
  subscribe(listener: Listener): () => void {
    _listeners.add(listener);
    return () => {
      _listeners.delete(listener);
    };
  },

  /** Get current snapshot of entries (newest first) */
  getEntries(): NetworkLogEntry[] {
    return _entries;
  },

  /** Add a new pending entry. Returns entry id */
  addEntry(entry: Omit<NetworkLogEntry, "id">): string {
    const id = `nlog-${++_idCounter}-${Date.now()}`;
    const full: NetworkLogEntry = { ...entry, id };
    _entries = [full, ..._entries].slice(0, _maxEntries);
    notify();
    return id;
  },

  /** Update an existing entry (e.g. when response arrives) */
  updateEntry(id: string, update: Partial<NetworkLogEntry>) {
    _entries = _entries.map((e) => (e.id === id ? { ...e, ...update } : e));
    notify();
  },

  /** Clear all entries */
  clear() {
    _entries = [];
    notify();
  },

  /** Set max retained entries */
  setMaxEntries(n: number) {
    _maxEntries = n;
    if (_entries.length > n) {
      _entries = _entries.slice(0, n);
      notify();
    }
  },
};

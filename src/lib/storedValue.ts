"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * localStorage-gestützter Zustand, der zwischen Tabs desselben Browsers synchron bleibt
 * (`storage`-Event) und innerhalb eines Tabs über ein eigenes Event.
 *
 * Phase 0: Trainer-Tab und Teilnehmer-Tab auf demselben Gerät teilen sich so die Session.
 * Phase 1 ersetzt die Quelle durch den Server (Polling), die Screens bleiben gleich.
 */
const LOCAL_EVENT = "cw:stored-value";

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parse<T>(raw: string | null): T | null {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Aktuellen Wert direkt lesen (für asynchrone Callbacks, die keinen veralteten Closure-Stand nutzen dürfen). */
export function readStored<T>(key: string): T | null {
  return parse<T>(readRaw(key));
}

export function writeStored<T>(key: string, value: T | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: key }));
  } catch {
    /* Private Mode o. ä. */
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_EVENT, callback);
  };
}

export function useStoredValue<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  // Der Snapshot ist der Roh-String: gleicher Inhalt → gleicher Snapshot → kein Re-Render
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );
  // Server-Render und erster Client-Render: false; danach true
  const loaded = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const value = useMemo(() => parse<T>(raw) ?? initial, [raw, initial]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = parse<T>(readRaw(key)) ?? initial;
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeStored(key, resolved);
    },
    [key, initial],
  );

  return [value, update, loaded];
}

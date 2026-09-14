"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Liest einen nur im Browser verfügbaren Wert (URL, localStorage, origin)
 * hydrationssicher: Server und erster Client-Render liefern `serverValue`.
 */
export function useClientValue<T>(getClient: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getClient, () => serverValue);
}

/**
 * Persistente, workshopübergreifende Teilnehmer-ID (Briefing A3/A5).
 *
 * Herkunft, in dieser Reihenfolge:
 *  1. `?u=<id>` in der Join-URL (vorab vergebene Codes, Badge-Scan, später)
 *  2. localStorage
 *  3. neu erzeugt
 *
 * Die konkrete Mechanik für die Workshop-Reihe ist noch offen; sie wird hier
 * eingehängt, ohne dass die App sonst etwas ändern muss.
 */
const KEY = "cw.userId";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateUserId(): string {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("u");
    if (fromUrl && fromUrl.length >= 4) {
      window.localStorage.setItem(KEY, fromUrl);
      return fromUrl;
    }
    const stored = window.localStorage.getItem(KEY);
    if (stored) return stored;
    const id = randomId();
    window.localStorage.setItem(KEY, id);
    return id;
  } catch {
    return randomId();
  }
}

/** Kurzform zur Anzeige, z. B. "A3F9-21" */
export function shortId(id: string): string {
  const clean = id.replace(/-/g, "").toUpperCase();
  return `${clean.slice(0, 4)}-${clean.slice(4, 6)}`;
}

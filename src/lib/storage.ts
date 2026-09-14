/**
 * localStorage-Zugriff für Gerätetoken, Spieler und persönlichen Rekord.
 * Alle Zugriffe sind abgesichert, weil localStorage im Private Mode fehlen kann.
 */
const KEYS = {
  deviceToken: "csc.deviceToken",
  playerId: "csc.playerId",
  nickname: "csc.nickname",
  personalBest: "csc.personalBest",
} as const;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* ignorieren */
  }
}

export interface StoredPlayer {
  deviceToken: string;
  playerId: string | null;
  nickname: string | null;
  personalBest: number;
}

/** S1.3 – Gerätetoken beim ersten Besuch erzeugen. */
export function getOrCreateDeviceToken(): string {
  const existing = read(KEYS.deviceToken);
  if (existing) return existing;
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  write(KEYS.deviceToken, token);
  return token;
}

export function loadStoredPlayer(): StoredPlayer {
  return {
    deviceToken: getOrCreateDeviceToken(),
    playerId: read(KEYS.playerId),
    nickname: read(KEYS.nickname),
    personalBest: Number(read(KEYS.personalBest) ?? 0) || 0,
  };
}

export function savePlayer(playerId: string, nickname: string) {
  write(KEYS.playerId, playerId);
  write(KEYS.nickname, nickname);
}

export function savePersonalBest(streak: number) {
  write(KEYS.personalBest, String(streak));
}

export function clearPlayer() {
  write(KEYS.playerId, null);
  write(KEYS.nickname, null);
  write(KEYS.personalBest, null);
}

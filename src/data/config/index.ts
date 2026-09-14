import { parseWorkshopConfig } from "@/engine/configSchema";
import type { WorkshopConfig } from "@/engine/types";
import demo from "./demo.json";
import demo2 from "./demo2.json";

/** Alle bekannten Konfigurationen, beim Import validiert. */
export const CONFIGS: Record<string, WorkshopConfig> = {
  demo: parseWorkshopConfig(demo),
  demo2: parseWorkshopConfig(demo2),
};

export function getConfig(ref: string): WorkshopConfig {
  const cfg = CONFIGS[ref];
  if (!cfg) throw new Error(`Unbekannte Konfiguration: ${ref}`);
  return cfg;
}

/**
 * Phase 0: Session-Code → Konfiguration. "demo" ist Competitor I, "demo2" Competitor II.
 * Ab Phase 1 steht die Zuordnung in der Session-Tabelle.
 */
export function configForCode(code: string): WorkshopConfig {
  return CONFIGS[code] ?? CONFIGS.demo;
}

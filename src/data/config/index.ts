import { parseWorkshopConfig } from "@/engine/configSchema";
import type { WorkshopConfig } from "@/engine/types";
import demo from "./demo.json";

/** Alle bekannten Konfigurationen, beim Import validiert. */
export const CONFIGS: Record<string, WorkshopConfig> = {
  demo: parseWorkshopConfig(demo),
};

export function getConfig(ref: string): WorkshopConfig {
  const cfg = CONFIGS[ref];
  if (!cfg) throw new Error(`Unbekannte Konfiguration: ${ref}`);
  return cfg;
}

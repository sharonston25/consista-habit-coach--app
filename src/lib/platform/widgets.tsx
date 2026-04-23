/**
 * Dashboard Widget Registry
 * -------------------------
 * Plug a new dashboard card in by calling `registerWidget()` once at module
 * import time. The dashboard renders all enabled widgets sorted by `order`.
 *
 * Each widget can declare a feature flag — when off, the widget is skipped.
 */
import type { ComponentType } from "react";
import type { FlagKey } from "./flags";
import { getFlag } from "./flags";

export type WidgetSlot = "hero" | "main" | "secondary" | "footer";

export interface WidgetDef {
  id: string;
  slot: WidgetSlot;
  order: number;
  component: ComponentType;
  /** Optional flag — widget is hidden when flag is false. */
  flag?: FlagKey;
  /** Optional predicate evaluated client-side (e.g. profile.gender === "female"). */
  enabled?: () => boolean;
}

const registry = new Map<string, WidgetDef>();

export function registerWidget(def: WidgetDef) {
  registry.set(def.id, def);
}

export function unregisterWidget(id: string) {
  registry.delete(id);
}

export function getWidgets(slot: WidgetSlot): WidgetDef[] {
  const out: WidgetDef[] = [];
  registry.forEach((w) => {
    if (w.slot !== slot) return;
    if (w.flag && !getFlag(w.flag)) return;
    if (w.enabled && !w.enabled()) return;
    out.push(w);
  });
  return out.sort((a, b) => a.order - b.order);
}

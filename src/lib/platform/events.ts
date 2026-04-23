/**
 * Typed Event Bus
 * ---------------
 * Domain-level pub/sub so new features can react to user actions without
 * coupling to stores. Producers `emit()` events; consumers `on()` listen.
 *
 * Add a new event by extending `AppEvents` below — all subscribers get
 * end-to-end typing automatically.
 */

export type AppEvents = {
  "habit:completed": { habitId: string; dateKey: string; status: "done" | "partial" };
  "habit:created": { habitId: string };
  "habit:deleted": { habitId: string };
  "meal:added": { dateKey: string; kcal: number };
  "water:logged": { dateKey: string; ml: number };
  "sleep:logged": { dateKey: string; hours: number; quality: number };
  "weight:logged": { dateKey: string; kg: number };
  "achievement:unlocked": { id: string };
  "milestone:reached": { streak: number };
  "streak:broken": { previousStreak: number };
};

type EventName = keyof AppEvents;
type Handler<E extends EventName> = (payload: AppEvents[E]) => void;

const handlers: { [K in EventName]?: Set<Handler<K>> } = {};

export function on<E extends EventName>(event: E, handler: Handler<E>): () => void {
  if (!handlers[event]) handlers[event] = new Set() as Set<Handler<E>>;
  (handlers[event] as Set<Handler<E>>).add(handler);
  return () => {
    (handlers[event] as Set<Handler<E>>).delete(handler);
  };
}

export function emit<E extends EventName>(event: E, payload: AppEvents[E]): void {
  const set = handlers[event] as Set<Handler<E>> | undefined;
  if (!set) return;
  set.forEach((h) => {
    try {
      h(payload);
    } catch (err) {
      // Never let one subscriber crash the rest
      // eslint-disable-next-line no-console
      console.error(`[events] handler for ${event} threw`, err);
    }
  });
}

/** React hook for declarative subscription. */
import { useEffect } from "react";
export function useEvent<E extends EventName>(event: E, handler: Handler<E>) {
  useEffect(() => {
    return on(event, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
}

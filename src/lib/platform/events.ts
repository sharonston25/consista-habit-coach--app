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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers = new Map<EventName, Set<(payload: any) => void>>();

export function on<E extends EventName>(event: E, handler: Handler<E>): () => void {
  let set = handlers.get(event);
  if (!set) {
    set = new Set();
    handlers.set(event, set);
  }
  set.add(handler as (p: unknown) => void);
  return () => {
    set!.delete(handler as (p: unknown) => void);
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

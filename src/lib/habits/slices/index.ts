/**
 * Domain Slices
 * -------------
 * Re-exports grouped by concern so feature work imports the slice it needs
 * instead of the monolithic store. Implementation still lives in `../store.ts`
 * — these files are stable seams for future migration to per-slice stores.
 */
export * as habitsSlice from "./habits";
export * as nutritionSlice from "./nutrition";
export * as wellnessSlice from "./wellness";
export * as gamificationSlice from "./gamification";

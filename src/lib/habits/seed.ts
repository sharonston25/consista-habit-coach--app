import type { Habit } from "./types";

export const PREDEFINED_HABITS: Habit[] = [
  { id: "h-water", name: "Drink water", icon: "💧", color: "water", reminder: "09:00", createdAt: new Date().toISOString() },
  { id: "h-exercise", name: "Exercise", icon: "🏋️", color: "exercise", reminder: "07:00", createdAt: new Date().toISOString() },
  { id: "h-study", name: "Study", icon: "📚", color: "study", reminder: "18:00", createdAt: new Date().toISOString() },
  { id: "h-read", name: "Read books", icon: "📖", color: "read", reminder: "21:00", createdAt: new Date().toISOString() },
  { id: "h-sleep", name: "Sleep on time", icon: "🌙", color: "sleep", reminder: "22:30", createdAt: new Date().toISOString() },
  { id: "h-meditation", name: "Meditation", icon: "🧘", color: "meditation", reminder: "06:30", createdAt: new Date().toISOString() },
  { id: "h-walk", name: "Walk", icon: "🚶", color: "walk", reminder: "17:00", createdAt: new Date().toISOString() },
  { id: "h-coding", name: "Coding practice", icon: "💻", color: "coding", reminder: "20:00", createdAt: new Date().toISOString() },
];

export const QUOTES = [
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "You'll never change your life until you change something you do daily.", author: "John C. Maxwell" },
  { text: "Motivation gets you going, but discipline keeps you growing.", author: "John C. Maxwell" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "Progress, not perfection.", author: "Anonymous" },
  { text: "Every action you take is a vote for the person you wish to become.", author: "James Clear" },
  { text: "The only bad workout is the one that didn't happen.", author: "Anonymous" },
  { text: "You don't have to be extreme, just consistent.", author: "Anonymous" },
  { text: "Show up. Even when you don't feel like it.", author: "Anonymous" },
];

export const FUN_FACTS = [
  "It takes an average of 66 days to form a new habit — not 21!",
  "Drinking water boosts brain performance by up to 14%.",
  "Just 10 minutes of walking can improve your mood for hours.",
  "Reading 6 minutes a day reduces stress by 68%.",
  "People who meditate regularly have measurably more grey matter.",
  "Sleeping 7-9 hours can extend your lifespan significantly.",
  "Exercise releases endorphins — nature's antidepressant.",
  "Studying just 20 minutes daily compounds to 120 hours per year.",
  "Smiling — even when forced — actually improves your mood.",
  "Writing your goals down makes you 42% more likely to achieve them.",
  "Coding for 30 min/day builds expertise faster than weekly cramming.",
  "Deep breathing for 2 minutes can lower stress hormones.",
  "Sunlight in the first hour of waking regulates your circadian rhythm.",
  "Standing breaks every 30 min reduce risk of chronic disease.",
  "Listening to music while exercising boosts performance by 15%.",
];

export const STRESS_TIPS = [
  "Take 5 slow breaths: inhale 4s, hold 4s, exhale 6s. Repeat.",
  "Step outside for 2 minutes. Sunlight resets your nervous system.",
  "Stretch your shoulders and neck — tension lives there.",
  "Drink a full glass of water slowly. Hydration calms the body.",
  "Write down 3 things you're grateful for right now.",
  "Put your phone face down for the next 15 minutes.",
  "Box breathing: 4s in, 4s hold, 4s out, 4s hold. Do 4 rounds.",
  "Smile for 30 seconds — it tricks your brain into calm.",
];

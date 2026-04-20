import { useEffect, useState } from "react";
import { useSettings, useProfile } from "@/lib/habits/store";

export function useTheme() {
  const { settings, setSettings } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.theme]);
  const toggle = () =>
    setSettings({ ...settings, theme: settings.theme === "dark" ? "light" : "dark" });
  return { theme: settings.theme, toggle };
}

export function useGreeting(): { text: string; ready: boolean } {
  const { profile, mounted } = useProfile();
  const [tod, setTod] = useState<string>("");

  useEffect(() => {
    const h = new Date().getHours();
    setTod(
      h < 5
        ? "Good night"
        : h < 12
          ? "Good morning"
          : h < 17
            ? "Good afternoon"
            : h < 21
              ? "Good evening"
              : "Good night",
    );
  }, []);

  const ready = mounted && !!tod;
  if (!ready) return { text: "", ready: false };
  const name = profile?.name ?? "";
  return { text: name ? `${tod}, ${name}` : tod, ready: true };
}

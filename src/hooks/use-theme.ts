import { useEffect, useState } from "react";
import { useSettings, useProfile } from "@/lib/habits/store";

export function useTheme() {
  const { settings, setSettings, mounted } = useSettings();
  useEffect(() => {
    // Don't touch the class until we've actually loaded settings from localStorage
    // (otherwise we momentarily strip `.dark` that the inline script in __root applied).
    if (!mounted) return;
    const root = document.documentElement;
    if (settings.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.theme, mounted]);
  const toggle = () =>
    setSettings({ ...settings, theme: settings.theme === "dark" ? "light" : "dark" });
  return { theme: settings.theme, toggle, mounted };
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

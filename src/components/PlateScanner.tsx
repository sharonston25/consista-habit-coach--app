import { useRef, useState } from "react";
import { Camera, Loader2, X, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface PlateAnalysis {
  name: string;
  kcal: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  ingredients?: string[];
  tip?: string;
  confidence?: "low" | "medium" | "high";
}

interface PlateScannerProps {
  onLog: (meal: { name: string; kcal: number }) => void;
}

export function PlateScanner({ onLog }: PlateScannerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlateAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image of your meal.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image is too large. Try a smaller photo (under 8 MB).");
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      // Downscale to keep payload small & fast
      const dataUrl = await downscaleImage(file, 768);
      setPreview(dataUrl);

      const resp = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json?.error ?? `Request failed (${resp.status})`);
      }
      setResult(json as PlateAnalysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't analyze the photo.");
    } finally {
      setLoading(false);
    }
  };

  const logIt = () => {
    if (!result || !result.kcal) {
      toast.error("No calories detected — try a clearer photo first.");
      return;
    }
    onLog({ name: result.name || "Meal photo", kcal: Math.round(result.kcal) });
    toast.success(`Logged ${result.name || "meal"} · ${result.kcal} kcal`);
    reset();
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Camera className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">Snap your plate</p>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
          <Sparkles className="h-3 w-3" /> AI
        </span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Take a photo of your meal — the AI will estimate calories, protein, carbs and fat.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {!preview && !loading && (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/40 px-4 py-6 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
        >
          <Camera className="h-5 w-5" />
          Open camera or pick a photo
        </button>
      )}

      {(preview || loading) && (
        <div className="space-y-3">
          {preview && (
            <div className="relative overflow-hidden rounded-xl border border-border/60">
              <img src={preview} alt="Meal preview" className="h-44 w-full object-cover" />
              <button
                onClick={reset}
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground shadow-soft hover:bg-background"
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/40 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your plate…
            </div>
          )}

          {error && !loading && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          {result && !loading && (
            <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold">
                  {result.name || "Meal"}
                </p>
                <p className="shrink-0 text-base font-bold text-primary">
                  {result.kcal || 0} kcal
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                <Macro label="Protein" g={result.protein_g} tone="bg-[oklch(0.7_0.1_45_/_0.18)]" />
                <Macro label="Carbs" g={result.carbs_g} tone="bg-[oklch(0.7_0.08_220_/_0.18)]" />
                <Macro label="Fat" g={result.fat_g} tone="bg-[oklch(0.78_0.1_70_/_0.18)]" />
              </div>
              {result.ingredients?.length ? (
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Ingredients:</span>{" "}
                  {result.ingredients.slice(0, 6).join(", ")}
                </p>
              ) : null}
              {result.tip && (
                <p className="rounded-lg bg-primary/10 px-2 py-1.5 text-[11px] leading-relaxed text-foreground">
                  💡 {result.tip}
                </p>
              )}
              {result.confidence && (
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Confidence:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      result.confidence === "high" && "text-success",
                      result.confidence === "medium" && "text-warning",
                      result.confidence === "low" && "text-destructive",
                    )}
                  >
                    {result.confidence}
                  </span>
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={logIt}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:scale-[1.01]"
                >
                  <Plus className="h-3.5 w-3.5" /> Log this meal
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:border-primary/40"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Macro({ label, g, tone }: { label: string; g: number | undefined; tone: string }) {
  return (
    <div className={cn("rounded-lg p-2", tone)}>
      <p className="text-[10px] uppercase tracking-wider opacity-75">{label}</p>
      <p className="text-sm font-semibold">{g ?? 0}g</p>
    </div>
  );
}

async function downscaleImage(file: File, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read the file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't load the image."));
      img.onload = () => {
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported."));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

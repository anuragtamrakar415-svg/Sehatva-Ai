"use client";

import { useState } from "react";
import { Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";

export function HydrationTracker() {
  const [glasses, setGlasses] = useState(6);
  const total = 8;

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl bg-brand-500 p-5 text-white">
      <div className="flex items-center gap-4">
        <ProgressRing
          percent={Math.round((glasses / total) * 100)}
          size={72}
          stroke={8}
          trackColor="rgba(255,255,255,0.22)"
          progressColor="#ffffff"
          label={`${glasses}/${total}`}
        />
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Droplet className="h-4 w-4" /> Glasses
          </p>
          <p className="mt-1 text-xs text-white/80">Good job! Keep drinking water</p>
        </div>
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="!bg-white !text-brand-700 hover:!bg-white/90"
        onClick={() => setGlasses((g) => Math.min(total, g + 1))}
      >
        Add Water
      </Button>
    </div>
  );
}

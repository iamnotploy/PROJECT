import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("grid size-9 place-items-center rounded-xl", inverse ? "bg-white/15 text-white" : "bg-brand-100 text-brand-700")}>
        <Sparkles className="size-4.5" strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className={cn("text-[15px] font-black tracking-[0.2em]", inverse ? "text-white" : "text-brand-900")}>
          LUMA <span className={cn("font-medium tracking-normal", inverse ? "text-white/60" : "text-muted-ink")}>MUKDAHAN</span>
        </span>
      )}
    </div>
  );
}

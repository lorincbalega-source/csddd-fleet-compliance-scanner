import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface DiscrepanciesSummaryProps {
  discrepancies: string[];
  t: Translations;
}

export function DiscrepanciesSummary({ discrepancies, t }: DiscrepanciesSummaryProps) {
  const isClear = discrepancies.length === 0;

  return (
    <section
      className={cn(
        "rounded-2xl border p-6 shadow-card",
        isClear ? "border-emerald-200/80 bg-emerald-50/60" : "border-red-200/80 bg-red-50/50",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            isClear ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600",
          )}
        >
          {isClear ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className={cn(
                "text-base font-semibold",
                isClear ? "text-emerald-950" : "text-red-950",
              )}
            >
              {t.discrepancies.title}
            </h2>
            {isClear && (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                {t.discrepancies.allClear}
              </span>
            )}
          </div>
          <p className={cn("mt-0.5 text-sm", isClear ? "text-emerald-800/80" : "text-red-800/80")}>
            {t.discrepancies.subtitle}
          </p>

          {isClear ? (
            <p className="mt-3 text-sm font-medium text-emerald-900">{t.discrepancies.empty}</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {discrepancies.map((item, index) => (
                <li
                  key={index}
                  className="flex gap-2.5 rounded-xl border border-red-100 bg-white/70 px-3 py-2 text-sm text-red-900"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

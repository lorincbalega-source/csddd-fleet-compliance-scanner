import type { CheckStatus, RiskLevel } from "@/lib/types";
import type { Translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CheckStatus | RiskLevel;
  label: string;
  size?: "sm" | "md";
}

const statusStyles: Record<string, string> = {
  compliant: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20",
  action_needed: "bg-amber-500/10 text-amber-800 ring-amber-500/25",
  high_risk: "bg-red-500/10 text-red-700 ring-red-600/20",
  missing: "bg-red-500/10 text-red-700 ring-red-600/20",
  unclear: "bg-amber-500/10 text-amber-800 ring-amber-500/25",
};

const dotStyles: Record<string, string> = {
  compliant: "bg-emerald-500",
  action_needed: "bg-amber-500",
  high_risk: "bg-red-500",
  missing: "bg-red-500",
  unclear: "bg-amber-500",
};

export function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
        size === "sm" ? "px-2.5 py-1 text-[11px] tracking-wide" : "px-3 py-1 text-xs",
        statusStyles[status] ?? "bg-slate-100 text-slate-700 ring-slate-300/60",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[status] ?? "bg-slate-400")} />
      {label}
    </span>
  );
}

export function getRiskLabel(risk: RiskLevel, t: Translations): string {
  const map: Record<RiskLevel, string> = {
    compliant: t.risk.compliant,
    action_needed: t.risk.actionNeeded,
    high_risk: t.risk.highRisk,
  };
  return map[risk];
}

export function getCheckStatusLabel(status: CheckStatus, t: Translations): string {
  const map: Record<CheckStatus, string> = {
    compliant: t.status.compliant,
    missing: t.status.missing,
    unclear: t.status.unclear,
  };
  return map[status];
}

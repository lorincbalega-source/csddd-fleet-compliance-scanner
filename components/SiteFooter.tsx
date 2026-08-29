import { ShieldCheck } from "lucide-react";
import type { Translations } from "@/lib/translations";

interface SiteFooterProps {
  t: Translations;
}

export function SiteFooter({ t }: SiteFooterProps) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">{t.app.name}</span>
        </div>
        <p className="text-xs leading-relaxed">{t.footer.legal}</p>
        <p className="text-xs">{t.footer.poweredBy}</p>
      </div>
    </footer>
  );
}

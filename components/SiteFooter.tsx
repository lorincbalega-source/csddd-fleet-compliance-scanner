import { Logo } from "@/components/Logo";
import type { Translations } from "@/lib/translations";

interface SiteFooterProps {
  t: Translations;
}

export function SiteFooter({ t }: SiteFooterProps) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Logo />
        <p className="text-xs leading-relaxed">{t.footer.legal}</p>
        <p className="text-xs">{t.footer.poweredBy}</p>
      </div>
    </footer>
  );
}

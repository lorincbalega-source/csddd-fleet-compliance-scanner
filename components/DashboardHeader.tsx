import { DockifyLogo } from "@/components/DockifyLogo";
import type { Translations } from "@/lib/translations";

interface DashboardHeaderProps {
  t: Translations;
}

export function DashboardHeader({ t }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="min-w-0" aria-label={t.app.name}>
          <DockifyLogo />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <a href="/inbox" className="transition-colors hover:text-white">
            {t.nav.inbox}
          </a>
          <a href="#product" className="transition-colors hover:text-white">
            {t.nav.product}
          </a>
          <a href="#features" className="transition-colors hover:text-white">
            {t.nav.features}
          </a>
          <a href="#pricing" className="transition-colors hover:text-white">
            {t.nav.pricing}
          </a>
        </nav>

        <a
          href="#audit"
          className="inline-flex min-h-10 items-center rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-900/30 transition hover:bg-brand-500"
        >
          {t.nav.tryAudit}
        </a>
      </div>
    </header>
  );
}

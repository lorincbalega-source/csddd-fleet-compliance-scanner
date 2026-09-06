import { ArrowRight, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import type { Translations } from "@/lib/translations";

interface HeroSectionProps {
  t: Translations;
}

export function HeroSection({ t }: HeroSectionProps) {
  return (
    <section id="top" className="relative overflow-hidden bg-slate-950 text-white">
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            {t.landing.badge}
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
            {t.landing.headline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {t.landing.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="/inbox"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 transition hover:bg-brand-500"
            >
              {t.landing.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              {t.landing.ctaSecondary}
            </a>
          </div>

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {t.landing.trust}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            <span>{t.landing.statAudits}</span>
            <span className="hidden text-slate-600 sm:inline">·</span>
            <span>{t.landing.statDocs}</span>
            <span className="hidden text-slate-600 sm:inline">·</span>
            <span>{t.landing.statLang}</span>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-card-lg backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <ScanLine className="h-4 w-4 text-brand-400" />
                Live vision audit
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                2.4s
              </span>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { label: "Stamp & signature", status: "Missing stamp", tone: "red" },
                { label: "Gross weight vs invoice", status: "Mismatch 1,240 kg", tone: "amber" },
                { label: "CMR consignment no.", status: "Extracted", tone: "green" },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2.5"
                >
                  <span className="text-slate-300">{row.label}</span>
                  <span
                    className={
                      row.tone === "green"
                        ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300"
                        : row.tone === "amber"
                          ? "rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-200"
                          : "rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300"
                    }
                  >
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-950/80 px-3 py-3 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-brand-400" />
              Billing blocked until stamp is confirmed on POD.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

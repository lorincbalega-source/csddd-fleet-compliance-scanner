import { Check } from "lucide-react";
import type { Translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface PricingSectionProps {
  t: Translations;
}

export function PricingSection({ t }: PricingSectionProps) {
  const plans = [
    {
      name: t.pricing.starterName,
      price: t.pricing.starterPrice,
      period: true,
      audits: t.pricing.starterAudits,
      cta: t.pricing.starterCta,
      href: "#audit",
      featured: false,
      features: [t.pricing.starterF1, t.pricing.starterF2, t.pricing.starterF3, t.pricing.starterF4],
    },
    {
      name: t.pricing.proName,
      price: t.pricing.proPrice,
      period: true,
      audits: t.pricing.proAudits,
      cta: t.pricing.proCta,
      href: "#audit",
      featured: true,
      features: [t.pricing.proF1, t.pricing.proF2, t.pricing.proF3, t.pricing.proF4],
    },
    {
      name: t.pricing.enterpriseName,
      price: t.pricing.enterprisePrice,
      period: false,
      audits: t.pricing.enterpriseAudits,
      cta: t.pricing.enterpriseCta,
      href: "mailto:sales@dockify.ai?subject=Dockify%20Enterprise",
      featured: false,
      features: [
        t.pricing.enterpriseF1,
        t.pricing.enterpriseF2,
        t.pricing.enterpriseF3,
        t.pricing.enterpriseF4,
      ],
    },
  ];

  return (
    <section id="pricing" className="scroll-mt-20 bg-slate-950 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-400">
          {t.pricing.kicker}
        </p>
        <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight">{t.pricing.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{t.pricing.subtitle}</p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "flex flex-col rounded-2xl border p-6 shadow-card",
                plan.featured
                  ? "border-brand-400/40 bg-slate-900 ring-1 ring-brand-500/30"
                  : "border-white/10 bg-slate-900/60",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  {plan.name}
                </h3>
                {plan.featured && (
                  <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    {t.pricing.popular}
                  </span>
                )}
              </div>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm font-medium text-slate-500">{t.pricing.perMonth}</span>
                )}
              </p>
              <p className="mt-1 text-sm text-slate-400">{plan.audits}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={cn(
                  "mt-8 inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
                  plan.featured
                    ? "bg-brand-600 text-white hover:bg-brand-500"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                )}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Languages, ScanSearch, ShieldAlert } from "lucide-react";
import type { Translations } from "@/lib/translations";

interface ValuePropositionProps {
  t: Translations;
}

export function ValueProposition({ t }: ValuePropositionProps) {
  const cards = [
    {
      icon: ScanSearch,
      title: t.value.extractionTitle,
      body: t.value.extractionBody,
    },
    {
      icon: ShieldAlert,
      title: t.value.discrepancyTitle,
      body: t.value.discrepancyBody,
    },
    {
      icon: Languages,
      title: t.value.emailTitle,
      body: t.value.emailBody,
    },
  ];

  return (
    <section id="features" className="scroll-mt-20 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
          {t.value.kicker}
        </p>
        <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900">
          {t.value.title}
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-brand-400 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

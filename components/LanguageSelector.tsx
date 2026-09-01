"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Translations } from "@/lib/translations";
import { filterTradeLanguages, TRADE_LANGUAGES, type TradeLanguage } from "@/lib/languages";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  t: Translations;
}

function LanguageButton({
  lang,
  active,
  onSelect,
}: {
  lang: TradeLanguage;
  active: boolean;
  onSelect: (lang: TradeLanguage) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lang)}
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
        active
          ? "border-brand-400 bg-brand-50 ring-1 ring-brand-500/30"
          : "border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50",
      )}
    >
      <span className="text-2xl leading-none" aria-hidden>
        {lang.flag}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-slate-900">{lang.name}</span>
        <span className="block truncate text-xs text-slate-500">{lang.nativeName}</span>
      </span>
    </button>
  );
}

export function LanguageSelector({ t }: LanguageSelectorProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("en");

  const filtered = useMemo(() => filterTradeLanguages(query), [query]);
  const europe = filtered.filter((lang) => lang.region === "europe");
  const global = filtered.filter((lang) => lang.region === "global");

  const previewLang =
    filtered.find((lang) => lang.id === selectedId) ?? filtered[0] ?? TRADE_LANGUAGES[0];

  return (
    <section id="languages" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="border-b border-slate-100 bg-slate-950 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-400">
          {t.languages.kicker}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">{t.languages.title}</h2>
        <p className="mt-1 text-sm text-slate-400">{t.languages.subtitle}</p>
      </div>

      <div className="p-6">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.languages.searchPlaceholder}
            className="min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none ring-brand-500 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-2"
          />
        </label>

        <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-3 [scrollbar-width:thin]">
          {filtered.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-slate-500">{t.languages.empty}</p>
          ) : (
            <div className="space-y-5">
              {europe.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {t.languages.europe}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {europe.map((lang) => (
                      <LanguageButton
                        key={lang.id}
                        lang={lang}
                        active={previewLang.id === lang.id}
                        onSelect={(next) => {
                          setSelectedId(next.id);
                          setQuery("");
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {global.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {t.languages.global}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {global.map((lang) => (
                      <LanguageButton
                        key={lang.id}
                        lang={lang}
                        active={previewLang.id === lang.id}
                        onSelect={(next) => {
                          setSelectedId(next.id);
                          setQuery("");
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p
          className="mt-4 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-900"
          role="status"
        >
          {t.languages.previewPrefix} {previewLang.name}
        </p>
      </div>
    </section>
  );
}

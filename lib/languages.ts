export type LanguageRegion = "europe" | "global";

export interface TradeLanguage {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  region: LanguageRegion;
  searchTerms: string;
}

export const TRADE_LANGUAGES: TradeLanguage[] = [
  {
    id: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    region: "europe",
    searchTerms: "english en gb uk britain",
  },
  {
    id: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    region: "europe",
    searchTerms: "german deutsch de germany",
  },
  {
    id: "hu",
    name: "Hungarian",
    nativeName: "Magyar",
    flag: "🇭🇺",
    region: "europe",
    searchTerms: "hungarian magyar hu hungary",
  },
  {
    id: "pl",
    name: "Polish",
    nativeName: "Polski",
    flag: "🇵🇱",
    region: "europe",
    searchTerms: "polish polski pl poland",
  },
  {
    id: "ro",
    name: "Romanian",
    nativeName: "Română",
    flag: "🇷🇴",
    region: "europe",
    searchTerms: "romanian romana ro romania",
  },
  {
    id: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    region: "europe",
    searchTerms: "french francais fr france",
  },
  {
    id: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    region: "europe",
    searchTerms: "italian italiano it italy",
  },
  {
    id: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱",
    region: "europe",
    searchTerms: "dutch nederlands nl netherlands holland",
  },
  {
    id: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    region: "europe",
    searchTerms: "spanish espanol es spain",
  },
  {
    id: "cs",
    name: "Czech",
    nativeName: "Čeština",
    flag: "🇨🇿",
    region: "europe",
    searchTerms: "czech cestina cs czechia",
  },
  {
    id: "sk",
    name: "Slovak",
    nativeName: "Slovenčina",
    flag: "🇸🇰",
    region: "europe",
    searchTerms: "slovak slovencina sk slovakia",
  },
  {
    id: "bg",
    name: "Bulgarian",
    nativeName: "Български",
    flag: "🇧🇬",
    region: "europe",
    searchTerms: "bulgarian bg bulgaria",
  },
  {
    id: "sr",
    name: "Serbian",
    nativeName: "Srpski",
    flag: "🇷🇸",
    region: "europe",
    searchTerms: "serbian srpski sr serbia",
  },
  {
    id: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    flag: "🇺🇦",
    region: "europe",
    searchTerms: "ukrainian uk ukraine",
  },
  {
    id: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    flag: "🇸🇪",
    region: "europe",
    searchTerms: "swedish svenska sv sweden",
  },
  {
    id: "da",
    name: "Danish",
    nativeName: "Dansk",
    flag: "🇩🇰",
    region: "europe",
    searchTerms: "danish dansk da denmark",
  },
  {
    id: "zh",
    name: "Chinese (Mandarin)",
    nativeName: "中文",
    flag: "🇨🇳",
    region: "global",
    searchTerms: "chinese mandarin zh cn china putonghua",
  },
  {
    id: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    region: "global",
    searchTerms: "japanese ja jp japan",
  },
  {
    id: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    region: "global",
    searchTerms: "korean ko kr korea",
  },
  {
    id: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
    region: "global",
    searchTerms: "vietnamese vi vn vietnam",
  },
  {
    id: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    region: "global",
    searchTerms: "turkish turkce tr turkey",
  },
  {
    id: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    region: "global",
    searchTerms: "arabic ar gulf mena",
  },
];

export function filterTradeLanguages(query: string): TradeLanguage[] {
  const q = query.trim().toLowerCase();
  if (!q) return TRADE_LANGUAGES;
  return TRADE_LANGUAGES.filter((lang) =>
    `${lang.name} ${lang.nativeName} ${lang.searchTerms}`.toLowerCase().includes(q),
  );
}

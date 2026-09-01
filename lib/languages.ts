export type LanguageRegion = "europe" | "global";

export interface TradeLanguage {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  countryCode: string;
  region: LanguageRegion;
  searchTerms: string;
}

export const TRADE_LANGUAGES: TradeLanguage[] = [
  {
    id: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    countryCode: "GB",
    region: "europe",
    searchTerms: "english en gb uk britain",
  },
  {
    id: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    countryCode: "DE",
    region: "europe",
    searchTerms: "german deutsch de germany",
  },
  {
    id: "hu",
    name: "Hungarian",
    nativeName: "Magyar",
    flag: "🇭🇺",
    countryCode: "HU",
    region: "europe",
    searchTerms: "hungarian magyar hu hungary",
  },
  {
    id: "pl",
    name: "Polish",
    nativeName: "Polski",
    flag: "🇵🇱",
    countryCode: "PL",
    region: "europe",
    searchTerms: "polish polski pl poland",
  },
  {
    id: "ro",
    name: "Romanian",
    nativeName: "Română",
    flag: "🇷🇴",
    countryCode: "RO",
    region: "europe",
    searchTerms: "romanian romana ro romania",
  },
  {
    id: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    countryCode: "FR",
    region: "europe",
    searchTerms: "french francais fr france",
  },
  {
    id: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    countryCode: "IT",
    region: "europe",
    searchTerms: "italian italiano it italy",
  },
  {
    id: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱",
    countryCode: "NL",
    region: "europe",
    searchTerms: "dutch nederlands nl netherlands holland",
  },
  {
    id: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    countryCode: "ES",
    region: "europe",
    searchTerms: "spanish espanol es spain",
  },
  {
    id: "cs",
    name: "Czech",
    nativeName: "Čeština",
    flag: "🇨🇿",
    countryCode: "CZ",
    region: "europe",
    searchTerms: "czech cestina cs czechia",
  },
  {
    id: "sk",
    name: "Slovak",
    nativeName: "Slovenčina",
    flag: "🇸🇰",
    countryCode: "SK",
    region: "europe",
    searchTerms: "slovak slovencina sk slovakia",
  },
  {
    id: "bg",
    name: "Bulgarian",
    nativeName: "Български",
    flag: "🇧🇬",
    countryCode: "BG",
    region: "europe",
    searchTerms: "bulgarian bg bulgaria",
  },
  {
    id: "sr",
    name: "Serbian",
    nativeName: "Srpski",
    flag: "🇷🇸",
    countryCode: "RS",
    region: "europe",
    searchTerms: "serbian srpski sr serbia",
  },
  {
    id: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    flag: "🇺🇦",
    countryCode: "UA",
    region: "europe",
    searchTerms: "ukrainian uk ukraine",
  },
  {
    id: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    flag: "🇸🇪",
    countryCode: "SE",
    region: "europe",
    searchTerms: "swedish svenska sv sweden",
  },
  {
    id: "da",
    name: "Danish",
    nativeName: "Dansk",
    flag: "🇩🇰",
    countryCode: "DK",
    region: "europe",
    searchTerms: "danish dansk da denmark",
  },
  {
    id: "zh",
    name: "Chinese (Mandarin)",
    nativeName: "中文",
    flag: "🇨🇳",
    countryCode: "CN",
    region: "global",
    searchTerms: "chinese mandarin zh cn china putonghua",
  },
  {
    id: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    countryCode: "JP",
    region: "global",
    searchTerms: "japanese ja jp japan",
  },
  {
    id: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    countryCode: "KR",
    region: "global",
    searchTerms: "korean ko kr korea",
  },
  {
    id: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
    countryCode: "VN",
    region: "global",
    searchTerms: "vietnamese vi vn vietnam",
  },
  {
    id: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    countryCode: "TR",
    region: "global",
    searchTerms: "turkish turkce tr turkey",
  },
  {
    id: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    countryCode: "SA",
    region: "global",
    searchTerms: "arabic ar gulf mena",
  },
];

export const EMAIL_RECIPIENT_LANGUAGE_IDS = TRADE_LANGUAGES.map((lang) => lang.id);

export const EMAIL_RECIPIENT_LANGUAGES = TRADE_LANGUAGES;

export function recipientLanguageLabel(lang: TradeLanguage): string {
  const base = lang.id === "zh" ? "Chinese" : lang.name;
  return `${base} (${lang.countryCode})`;
}

export function resolveRecipientLanguage(id: string | null | undefined): TradeLanguage {
  const english = TRADE_LANGUAGES.find((lang) => lang.id === "en")!;
  if (!id) return english;
  const q = id.trim().toLowerCase();
  return (
    TRADE_LANGUAGES.find(
      (lang) =>
        lang.id === q ||
        lang.name.toLowerCase() === q ||
        lang.nativeName.toLowerCase() === q ||
        lang.countryCode.toLowerCase() === q,
    ) ?? english
  );
}


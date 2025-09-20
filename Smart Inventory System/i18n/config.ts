export type Locale =
  | "en" // English
  | "zh" // Chinese (Simplified)
  | "ja" // Japanese
  | "ko" // Korean
  | "th" // Thai
  | "vi" // Vietnamese
  | "ms" // Malay
  | "id" // Indonesian
  | "ar" // Arabic
  | "hi" // Hindi

export type LocaleConfig = {
  name: string
  nativeName: string
  direction: "ltr" | "rtl"
  dateFormat: string
  currencySymbol: string
  currencyCode: string
  thousandSeparator: string
  decimalSeparator: string
  currencyPosition: "before" | "after"
  measurementSystem: "metric" | "imperial"
  timeFormat: "12h" | "24h"
}

export const localeConfigs: Record<Locale, LocaleConfig> = {
  en: {
    name: "English",
    nativeName: "English",
    direction: "ltr",
    dateFormat: "MM/dd/yyyy",
    currencySymbol: "$",
    currencyCode: "USD",
    thousandSeparator: ",",
    decimalSeparator: ".",
    currencyPosition: "before",
    measurementSystem: "imperial",
    timeFormat: "12h",
  },
  zh: {
    name: "Chinese (Simplified)",
    nativeName: "中文",
    direction: "ltr",
    dateFormat: "yyyy/MM/dd",
    currencySymbol: "¥",
    currencyCode: "CNY",
    thousandSeparator: ",",
    decimalSeparator: ".",
    currencyPosition: "before",
    measurementSystem: "metric",
    timeFormat: "24h",
  },
  ja: {
    name: "Japanese",
    nativeName: "日本語",
    direction: "ltr",
    dateFormat: "yyyy/MM/dd",
    currencySymbol: "¥",
    currencyCode: "JPY",
    thousandSeparator: ",",
    decimalSeparator: ".",
    currencyPosition: "before",
    measurementSystem: "metric",
    timeFormat: "24h",
  },
  ko: {
    name: "Korean",
    nativeName: "한국어",
    direction: "ltr",
    dateFormat: "yyyy.MM.dd",
    currencySymbol: "₩",
    currencyCode: "KRW",
    thousandSeparator: ",",
    decimalSeparator: ".",
    currencyPosition: "before",
    measurementSystem: "metric",
    timeFormat: "24h",
  },
  th: {
    name: "Thai",
    nativeName: "ไทย",
    direction: "ltr",
    dateFormat: "dd/MM/yyyy",
    currencySymbol: "฿",
    currencyCode: "THB",
    thousandSeparator: ",",
    decimalSeparator: ".",
    currencyPosition: "before",
    measurementSystem: "metric",
    timeFormat: "24h",
  },
  vi: {
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    direction: "ltr",
    dateFormat: "dd/MM/yyyy",
    currencySymbol: "₫",
    currencyCode: "VND",
    thousandSeparator: ".",
    decimalSeparator: ",",
    currencyPosition: "after",
    measurementSystem: "metric",
    timeFormat: "24h",
  },
  ms: {
    name: "Malay",
    nativeName: "Bahasa Melayu",
    direction: "ltr",
    dateFormat: "dd/MM/yyyy",
    currencySymbol: "RM",
    currencyCode: "MYR",
    thousandSeparator: ",",
    decimalSeparator: ".",
    currencyPosition: "before",
    measurementSystem: "metric",
    timeFormat: "24h",
  },
  id: {
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    direction: "ltr",
    dateFormat: "dd/MM/yyyy",
    currencySymbol: "Rp",
    currencyCode: "IDR",
    thousandSeparator: ".",
    decimalSeparator: ",",
    currencyPosition: "before",
    measurementSystem: "metric",
    timeFormat: "24h",
  },
  ar: {
    name: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    dateFormat: "dd/MM/yyyy",
    currencySymbol: "ر.س",
    currencyCode: "SAR",
    thousandSeparator: ",",
    decimalSeparator: ".",
    currencyPosition: "after",
    measurementSystem: "metric",
    timeFormat: "24h",
  },
  hi: {
    name: "Hindi",
    nativeName: "हिन्दी",
    direction: "ltr",
    dateFormat: "dd/MM/yyyy",
    currencySymbol: "₹",
    currencyCode: "INR",
    thousandSeparator: ",",
    decimalSeparator: ".",
    currencyPosition: "before",
    measurementSystem: "metric",
    timeFormat: "24h",
  },
}

export const defaultLocale: Locale = "en"

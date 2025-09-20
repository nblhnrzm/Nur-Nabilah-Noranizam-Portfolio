import { en } from "./en"
import { zh } from "./zh"
import { ar } from "./ar"
import type { Locale } from "../config"

// For now, we'll only include English, Chinese, and Arabic
// In a real app, you would include all supported languages
export const translations: Record<Locale, Record<string, any>> = {
  en,
  zh,
  ar,
  // Add placeholders for other languages
  // In a real app, you would have complete translations for all languages
  ja: en, // Placeholder - would be replaced with actual Japanese translations
  ko: en, // Placeholder - would be replaced with actual Korean translations
  th: en, // Placeholder - would be replaced with actual Thai translations
  vi: en, // Placeholder - would be replaced with actual Vietnamese translations
  ms: en, // Placeholder - would be replaced with actual Malay translations
  id: en, // Placeholder - would be replaced with actual Indonesian translations
  hi: en, // Placeholder - would be replaced with actual Hindi translations
}

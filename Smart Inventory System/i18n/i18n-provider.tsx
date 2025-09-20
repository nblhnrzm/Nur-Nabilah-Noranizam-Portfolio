"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type Locale, localeConfigs, defaultLocale, type LocaleConfig } from "./config"
import { format as formatDate } from "date-fns"
import { enUS, zhCN, ja, ko, th, vi, ms, id, arSA, hi } from "date-fns/locale"

// Map of date-fns locales
const dateLocales = {
  en: enUS,
  zh: zhCN,
  ja,
  ko,
  th,
  vi,
  ms,
  id,
  ar: arSA,
  hi,
}

type I18nContextType = {
  locale: Locale
  localeConfig: LocaleConfig
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatDateTime: (date: Date | string | number, format?: string) => string
  formatCurrency: (amount: number) => string
  formatNumber: (num: number, decimals?: number) => string
  formatMeasurement: (value: number, unit: "weight" | "length" | "volume") => string
  dir: "ltr" | "rtl"
}

const I18nContext = createContext<I18nContextType | null>(null)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

type I18nProviderProps = {
  children: React.ReactNode
  initialLocale?: Locale
  translations: Record<Locale, Record<string, any>>
}

export function I18nProvider({ children, initialLocale = defaultLocale, translations }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [localeConfig, setLocaleConfig] = useState<LocaleConfig>(localeConfigs[initialLocale])

  // Load saved locale from localStorage on client side
  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale | null
    if (savedLocale && localeConfigs[savedLocale]) {
      setLocaleState(savedLocale)
      setLocaleConfig(localeConfigs[savedLocale])
      document.documentElement.dir = localeConfigs[savedLocale].direction
      document.documentElement.lang = savedLocale
    }
  }, [])

  // Set locale and save to localStorage
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setLocaleConfig(localeConfigs[newLocale])
    localStorage.setItem("locale", newLocale)
    document.documentElement.dir = localeConfigs[newLocale].direction
    document.documentElement.lang = newLocale
  }

  // Translation function - UPDATED to always return a string
  const t = (key: string, params?: Record<string, string | number>): string => {
    try {
      const keys = key.split(".")
      let value: any = translations[locale]
      let fallbackValue: any = translations[defaultLocale]

      // Try to navigate through the keys in the current locale
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]
        if (!value || !value[k]) {
          // If key not found in current locale, switch to fallback
          value = null
          break
        }
        value = value[k]
      }

      // If not found in current locale, try fallback locale
      if (value === null || value === undefined) {
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i]
          if (!fallbackValue || !fallbackValue[k]) {
            // If also not found in fallback, return the key itself
            return key
          }
          fallbackValue = fallbackValue[k]
        }
        value = fallbackValue
      }

      // If we still don't have a string, return the key
      if (typeof value !== "string") {
        return key
      }

      let result = value

      // Replace parameters in the translation string
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(`{{${paramKey}}}`, String(paramValue))
        })
      }

      return result
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error)
      return key // Return the key itself as fallback
    }
  }

  // Format date and time according to locale
  const formatDateTime = (date: Date | string | number, format?: string): string => {
    const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date
    const dateFormat = format || localeConfig.dateFormat

    return formatDate(dateObj, dateFormat, {
      locale: dateLocales[locale],
    })
  }

  // Format currency according to locale
  const formatCurrency = (amount: number): string => {
    const { currencySymbol, currencyPosition, thousandSeparator, decimalSeparator } = localeConfig

    const formattedAmount = amount
      .toFixed(2)
      .replace(".", decimalSeparator)
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)

    return currencyPosition === "before"
      ? `${currencySymbol}${formattedAmount}`
      : `${formattedAmount} ${currencySymbol}`
  }

  // Format number according to locale
  const formatNumber = (num: number, decimals = 2): string => {
    const { thousandSeparator, decimalSeparator } = localeConfig

    return num
      .toFixed(decimals)
      .replace(".", decimalSeparator)
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
  }

  // Format measurement according to locale's preferred system
  const formatMeasurement = (value: number, unit: "weight" | "length" | "volume"): string => {
    const { measurementSystem } = localeConfig

    if (unit === "weight") {
      if (measurementSystem === "metric") {
        return `${formatNumber(value)} kg`
      } else {
        return `${formatNumber(value * 2.20462)} lb`
      }
    } else if (unit === "length") {
      if (measurementSystem === "metric") {
        return `${formatNumber(value)} cm`
      } else {
        return `${formatNumber(value * 0.393701)} in`
      }
    } else if (unit === "volume") {
      if (measurementSystem === "metric") {
        return `${formatNumber(value)} L`
      } else {
        return `${formatNumber(value * 0.264172)} gal`
      }
    }

    return `${formatNumber(value)}`
  }

  const value = {
    locale,
    localeConfig,
    setLocale,
    t,
    formatDateTime,
    formatCurrency,
    formatNumber,
    formatMeasurement,
    dir: localeConfig.direction,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

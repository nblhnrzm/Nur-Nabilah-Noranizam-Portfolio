import { format, formatDistance, formatRelative } from "date-fns"
import { enUS, zhCN, ja, ko, th, vi, ms, id, arSA, hi } from "date-fns/locale"
import type { Locale } from "./config"

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

export function formatDate(date: Date | string | number, formatStr: string, locale: Locale): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date
  return format(dateObj, formatStr, { locale: dateLocales[locale] })
}

export function formatRelativeTime(
  date: Date | string | number,
  baseDate: Date | string | number,
  locale: Locale,
): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date
  const baseDateObj = typeof baseDate === "string" || typeof baseDate === "number" ? new Date(baseDate) : baseDate

  return formatRelative(dateObj, baseDateObj, { locale: dateLocales[locale] })
}

export function formatTimeAgo(date: Date | string | number, locale: Locale): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date

  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: dateLocales[locale],
  })
}

export function formatCurrencyValue(
  amount: number,
  currencySymbol: string,
  currencyPosition: "before" | "after",
  thousandSeparator: string,
  decimalSeparator: string,
  decimals = 2,
): string {
  const formattedAmount = amount
    .toFixed(decimals)
    .replace(".", decimalSeparator)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)

  return currencyPosition === "before" ? `${currencySymbol}${formattedAmount}` : `${formattedAmount} ${currencySymbol}`
}

export function formatNumberValue(
  num: number,
  thousandSeparator: string,
  decimalSeparator: string,
  decimals = 0,
): string {
  return num
    .toFixed(decimals)
    .replace(".", decimalSeparator)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
}

export function formatMeasurementValue(
  value: number,
  unit: "weight" | "length" | "volume",
  measurementSystem: "metric" | "imperial",
  thousandSeparator: string,
  decimalSeparator: string,
): string {
  if (unit === "weight") {
    if (measurementSystem === "metric") {
      return `${formatNumberValue(value, thousandSeparator, decimalSeparator, 2)} kg`
    } else {
      return `${formatNumberValue(value * 2.20462, thousandSeparator, decimalSeparator, 2)} lb`
    }
  } else if (unit === "length") {
    if (measurementSystem === "metric") {
      return `${formatNumberValue(value, thousandSeparator, decimalSeparator, 2)} cm`
    } else {
      return `${formatNumberValue(value * 0.393701, thousandSeparator, decimalSeparator, 2)} in`
    }
  } else if (unit === "volume") {
    if (measurementSystem === "metric") {
      return `${formatNumberValue(value, thousandSeparator, decimalSeparator, 2)} L`
    } else {
      return `${formatNumberValue(value * 0.264172, thousandSeparator, decimalSeparator, 2)} gal`
    }
  }

  return `${formatNumberValue(value, thousandSeparator, decimalSeparator, 2)}`
}

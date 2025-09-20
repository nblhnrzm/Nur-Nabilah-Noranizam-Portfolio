"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/i18n-provider"
import { type Locale, localeConfigs } from "@/i18n/config"
import { Save } from "lucide-react"

export function I18nSettings() {
  const { locale, localeConfig, setLocale, t } = useI18n()
  const [selectedLocale, setSelectedLocale] = useState<Locale>(locale)
  const [dateFormat, setDateFormat] = useState(localeConfig.dateFormat)
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">(localeConfig.timeFormat)
  const [measurementSystem, setMeasurementSystem] = useState<"metric" | "imperial">(localeConfig.measurementSystem)
  const [currencyCode, setCurrencyCode] = useState(localeConfig.currencyCode)

  const handleSave = () => {
    setLocale(selectedLocale)
    // In a real app, you would save the other preferences to user settings
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.language")}</CardTitle>
        <CardDescription>{t("settings.general")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="language">{t("settings.language")}</Label>
          <Select value={selectedLocale} onValueChange={(value) => setSelectedLocale(value as Locale)}>
            <SelectTrigger id="language">
              <SelectValue placeholder={t("settings.language")} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(localeConfigs).map(([localeCode, config]) => (
                <SelectItem key={localeCode} value={localeCode}>
                  {config.name} ({config.nativeName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFormat">{t("settings.dateFormat")}</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger id="dateFormat">
              <SelectValue placeholder={t("settings.dateFormat")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (05/12/2023)</SelectItem>
              <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (12/05/2023)</SelectItem>
              <SelectItem value="yyyy/MM/dd">YYYY/MM/DD (2023/05/12)</SelectItem>
              <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (2023-05-12)</SelectItem>
              <SelectItem value="dd.MM.yyyy">DD.MM.YYYY (12.05.2023)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("settings.timeFormat")}</Label>
          <RadioGroup value={timeFormat} onValueChange={(value) => setTimeFormat(value as "12h" | "24h")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="12h" id="12h" />
              <Label htmlFor="12h">12 {t("settings.timeFormat")} (1:30 PM)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="24h" id="24h" />
              <Label htmlFor="24h">24 {t("settings.timeFormat")} (13:30)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">{t("settings.currency")}</Label>
          <Select value={currencyCode} onValueChange={setCurrencyCode}>
            <SelectTrigger id="currency">
              <SelectValue placeholder={t("settings.currency")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
              <SelectItem value="CNY">CNY (¥) - Chinese Yuan</SelectItem>
              <SelectItem value="JPY">JPY (¥) - Japanese Yen</SelectItem>
              <SelectItem value="KRW">KRW (₩) - Korean Won</SelectItem>
              <SelectItem value="THB">THB (฿) - Thai Baht</SelectItem>
              <SelectItem value="VND">VND (₫) - Vietnamese Dong</SelectItem>
              <SelectItem value="MYR">MYR (RM) - Malaysian Ringgit</SelectItem>
              <SelectItem value="IDR">IDR (Rp) - Indonesian Rupiah</SelectItem>
              <SelectItem value="SAR">SAR (ر.س) - Saudi Riyal</SelectItem>
              <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("settings.measurementSystem")}</Label>
          <RadioGroup
            value={measurementSystem}
            onValueChange={(value) => setMeasurementSystem(value as "metric" | "imperial")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="metric" id="metric" />
              <Label htmlFor="metric">{t("settings.metric")} (kg, cm, L)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="imperial" id="imperial" />
              <Label htmlFor="imperial">{t("settings.imperial")} (lb, in, gal)</Label>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {t("settings.saveChanges")}
        </Button>
      </CardContent>
    </Card>
  )
}

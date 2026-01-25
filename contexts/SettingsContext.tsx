"use client"

import * as React from "react"

export interface Settings {
  defaultLivePreview: boolean
  defaultTheme: "light" | "dark" | "system"
  autoSaveToLocalStorage: boolean
  customCDNs: string[]
  editorFontSize: number
  editorTabSize: number
  editorWordWrap: boolean
  editorMinimap: boolean
  defaultLayoutPosition: "preview-top" | "preview-bottom" | "preview-left" | "preview-right"
  websiteColorScheme: "blue" | "purple" | "green" | "orange" | "red" | "pink" | "cyan" | "default"
}

const DEFAULT_SETTINGS: Settings = {
  defaultLivePreview: true,
  defaultTheme: "system",
  autoSaveToLocalStorage: false,
  customCDNs: [],
  editorFontSize: 14,
  editorTabSize: 2,
  editorWordWrap: true,
  editorMinimap: true,
  defaultLayoutPosition: "preview-top",
  websiteColorScheme: "default",
}

const SETTINGS_STORAGE_KEY = "upi-line-editor-settings"

interface SettingsContextType {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  updateSettings: (newSettings: Partial<Settings>) => void
  resetSettings: () => void
  addCustomCDN: (cdn: string) => void
  removeCustomCDN: (index: number) => void
  clearLocalStorage: () => void
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined)

function loadSettings(): Settings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS
  }

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to handle new settings that might not exist in old storage
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage:", error)
  }

  return DEFAULT_SETTINGS
}

function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error)
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<Settings>(loadSettings)

  // Load settings on mount
  React.useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
  }, [])

  const updateSetting = React.useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value }
      saveSettings(updated)
      return updated
    })
  }, [])

  const updateSettings = React.useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      saveSettings(updated)
      return updated
    })
  }, [])

  const resetSettings = React.useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
  }, [])

  const addCustomCDN = React.useCallback((cdn: string) => {
    if (!cdn.trim()) return
    setSettings((prev) => {
      const updated = {
        ...prev,
        customCDNs: [...prev.customCDNs, cdn.trim()],
      }
      saveSettings(updated)
      return updated
    })
  }, [])

  const removeCustomCDN = React.useCallback((index: number) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        customCDNs: prev.customCDNs.filter((_, i) => i !== index),
      }
      saveSettings(updated)
      return updated
    })
  }, [])

  const clearLocalStorage = React.useCallback(() => {
    if (typeof window === "undefined") return
    
    try {
      // Clear all localStorage items related to the editor
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
      localStorage.removeItem("upi-line-editor-files")
      // Reset settings to defaults
      setSettings(DEFAULT_SETTINGS)
      saveSettings(DEFAULT_SETTINGS)
    } catch (error) {
      console.error("Failed to clear localStorage:", error)
    }
  }, [])

  const value = React.useMemo(
    () => ({
      settings,
      updateSetting,
      updateSettings,
      resetSettings,
      addCustomCDN,
      removeCustomCDN,
      clearLocalStorage,
    }),
    [settings, updateSetting, updateSettings, resetSettings, addCustomCDN, removeCustomCDN, clearLocalStorage]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = React.useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return context
}

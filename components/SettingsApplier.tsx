"use client"

import * as React from "react"
import { useSettings } from "@/contexts/SettingsContext"
import { useFiles } from "@/contexts/FileContext"
import { useTheme } from "next-themes"

/**
 * Component that applies default settings from SettingsContext to FileContext
 * This runs inside SettingsProvider and FileProvider
 */
export function SettingsApplier() {
  const { settings } = useSettings()
  const { toggleLivePreview, livePreview, setLayout } = useFiles()
  const { setTheme } = useTheme()
  const [hasApplied, setHasApplied] = React.useState(false)

  // Apply default settings on mount (only once)
  React.useEffect(() => {
    if (hasApplied) return

    // Apply theme
    setTheme(settings.defaultTheme)

    // Apply live preview
    if (livePreview !== settings.defaultLivePreview) {
      toggleLivePreview()
    }

    // Apply layout (determine orientation from position)
    const orientation = settings.defaultLayoutPosition === "preview-top" || settings.defaultLayoutPosition === "preview-bottom" 
      ? "vertical" 
      : "horizontal"
    setLayout(orientation, settings.defaultLayoutPosition)

    setHasApplied(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return null
}

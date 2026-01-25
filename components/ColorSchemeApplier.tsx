"use client"

import * as React from "react"
import { useSettings } from "@/contexts/SettingsContext"

/**
 * Color scheme definitions for website customization
 */
const COLOR_SCHEMES: Record<string, { light: string; dark: string }> = {
  default: {
    light: "oklch(0.488 0.243 264.376)", // Original purple
    dark: "oklch(0.42 0.18 266)",
  },
  blue: {
    light: "oklch(0.55 0.22 250)",
    dark: "oklch(0.6 0.2 250)",
  },
  purple: {
    light: "oklch(0.55 0.25 300)",
    dark: "oklch(0.6 0.22 300)",
  },
  green: {
    light: "oklch(0.55 0.22 150)",
    dark: "oklch(0.6 0.2 150)",
  },
  orange: {
    light: "oklch(0.65 0.22 60)",
    dark: "oklch(0.7 0.2 60)",
  },
  red: {
    light: "oklch(0.55 0.22 25)",
    dark: "oklch(0.6 0.2 25)",
  },
  pink: {
    light: "oklch(0.65 0.22 340)",
    dark: "oklch(0.7 0.2 340)",
  },
  cyan: {
    light: "oklch(0.6 0.18 200)",
    dark: "oklch(0.65 0.16 200)",
  },
}

/**
 * Component that applies website color scheme to CSS variables
 */
export function ColorSchemeApplier() {
  const { settings } = useSettings()

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const scheme = COLOR_SCHEMES[settings.websiteColorScheme] || COLOR_SCHEMES.default
    const root = document.documentElement

    // Apply primary color to CSS variables
    root.style.setProperty("--primary", scheme.light)
    
    // For dark mode, we need to update the .dark class variables
    // We'll use a style tag to override dark mode colors
    let styleTag = document.getElementById("color-scheme-override")
    if (!styleTag) {
      styleTag = document.createElement("style")
      styleTag.id = "color-scheme-override"
      document.head.appendChild(styleTag)
    }
    
    styleTag.textContent = `
      .dark {
        --primary: ${scheme.dark} !important;
      }
    `
  }, [settings.websiteColorScheme])

  return null
}

"use client"

import * as React from "react"
import { Smartphone, Tablet, Laptop, Monitor, Move } from "lucide-react"
import { Button } from "@/components/ui/button"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type DevicePreset = "mobile" | "tablet" | "laptop" | "desktop" | "custom" | "resizable"

export interface ViewportSize {
  width: number
  height: number
  label: string
}

const DEVICE_PRESETS: Record<DevicePreset, ViewportSize> = {
  mobile: { width: 375, height: 667, label: "Mobile" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  laptop: { width: 1366, height: 768, label: "Laptop" },
  desktop: { width: 1920, height: 1080, label: "Desktop" },
  custom: { width: 0, height: 0, label: "Custom" },
  resizable: { width: 0, height: 0, label: "Free Resize" },
}

interface DevicePreviewProps {
  viewportSize: ViewportSize
  onViewportChange: (size: ViewportSize) => void
  enabled: boolean
  className?: string
}

export function DevicePreview({
  viewportSize,
  onViewportChange,
  enabled,
  className,
}: DevicePreviewProps) {
  const [customWidth, setCustomWidth] = React.useState("")
  const [customHeight, setCustomHeight] = React.useState("")
  const [showCustomInput, setShowCustomInput] = React.useState(false)

  const handlePresetSelect = (preset: DevicePreset) => {
    if (preset === "custom") {
      setShowCustomInput(true)
      if (viewportSize.width > 0 && viewportSize.height > 0) {
        setCustomWidth(viewportSize.width.toString())
        setCustomHeight(viewportSize.height.toString())
      }
    } else if (preset === "resizable") {
      setShowCustomInput(false)
      // Initialize with current size or default if not set
      const initialWidth = viewportSize.width > 0 ? viewportSize.width : 800
      const initialHeight = viewportSize.height > 0 ? viewportSize.height : 600
      onViewportChange({
        width: initialWidth,
        height: initialHeight,
        label: "Free Resize",
      })
    } else {
      setShowCustomInput(false)
      onViewportChange(DEVICE_PRESETS[preset])
    }
  }

  const handleCustomSizeApply = () => {
    const width = parseInt(customWidth) || 1920
    const height = parseInt(customHeight) || 1080
    onViewportChange({
      width: Math.max(320, Math.min(3840, width)),
      height: Math.max(240, Math.min(2160, height)),
      label: "Custom",
    })
    setShowCustomInput(false)
  }

  const currentPreset = React.useMemo(() => {
    if (viewportSize.label === "Custom") return "custom"
    if (viewportSize.label === "Free Resize") return "resizable"
    for (const [preset, size] of Object.entries(DEVICE_PRESETS)) {
      if (preset !== "custom" && preset !== "resizable" && size.width === viewportSize.width && size.height === viewportSize.height) {
        return preset as DevicePreset
      }
    }
    return "custom"
  }, [viewportSize])

  return (
    <div className={cn("flex items-center gap-2 px-2 py-1 border-b bg-muted/30", className)}>
      <div className="flex items-center gap-1 flex-1">
        <span className="text-xs text-muted-foreground mr-2">Viewport:</span>
        
        {/* Device Preset Buttons */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentPreset === "mobile" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => handlePresetSelect("mobile")}
              aria-label="Mobile viewport"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{DEVICE_PRESETS.mobile.label}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentPreset === "tablet" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => handlePresetSelect("tablet")}
              aria-label="Tablet viewport"
            >
              <Tablet className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{DEVICE_PRESETS.tablet.label}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentPreset === "laptop" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => handlePresetSelect("laptop")}
              aria-label="Laptop viewport"
            >
              <Laptop className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{DEVICE_PRESETS.laptop.label}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentPreset === "desktop" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => handlePresetSelect("desktop")}
              aria-label="Desktop viewport"
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{DEVICE_PRESETS.desktop.label}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentPreset === "resizable" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => handlePresetSelect("resizable")}
              aria-label="Free resize viewport"
            >
              <Move className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{DEVICE_PRESETS.resizable.label}</p>
          </TooltipContent>
        </Tooltip>

        {/* Custom Size Input */}
        {showCustomInput ? (
          <div className="flex items-center gap-1 ml-2">
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
              placeholder="Width"
              className="w-16 h-7 px-2 text-xs border rounded bg-background"
              min="320"
              max="3840"
            />
            <span className="text-xs text-muted-foreground">×</span>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
              placeholder="Height"
              className="w-16 h-7 px-2 text-xs border rounded bg-background"
              min="240"
              max="2160"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCustomSizeApply}
              aria-label="Apply custom size"
            >
              ✓
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowCustomInput(false)}
              aria-label="Cancel"
            >
              ×
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground ml-2">
            {viewportSize.width} × {viewportSize.height}
          </span>
        )}
      </div>
    </div>
  )
}

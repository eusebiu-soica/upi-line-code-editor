"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useSettings, type Settings } from "@/contexts/SettingsContext"
import { useTheme } from "next-themes"
import { useFiles } from "@/contexts/FileContext"
import { useIsMobile } from "@/hooks/use-nobile"
import {
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Palette,
  Save,
  Code,
  Layout,
  Monitor,
  Sun,
  Moon,
  Plus,
  X,
  RotateCcw,
  Info,
  FileCode,
  Folder,
  FolderArchive,
  Keyboard,
  Download,
  LayoutGrid,
  Image as ImageIcon,
  Zap,
  Sparkles,
  CheckCircle2,
  Trash2,
  Split,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SETTINGS_SECTIONS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "editor", label: "Editor", icon: Code },
  { id: "layout", label: "Layout", icon: Layout },
  { id: "advanced", label: "Advanced", icon: Wrench },
  { id: "about", label: "About", icon: Info },
] as const

type SectionId = (typeof SETTINGS_SECTIONS)[number]["id"]

export function Settings({ open, onOpenChange }: SettingsProps) {
  const { settings, updateSetting, resetSettings, addCustomCDN, removeCustomCDN, clearLocalStorage } = useSettings()
  const { setTheme, theme } = useTheme()
  const { toggleLivePreview, livePreview, setLayout } = useFiles()
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = React.useState<SectionId>("general")
  const [newCDN, setNewCDN] = React.useState("")
  const [mounted, setMounted] = React.useState(false)
  const [clearStorageOpen, setClearStorageOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    updateSetting("defaultTheme", newTheme)
    setTheme(newTheme)
    toast.success(`Theme set to ${newTheme}`)
  }

  const handleLivePreviewChange = (enabled: boolean) => {
    updateSetting("defaultLivePreview", enabled)
    if (livePreview !== enabled) {
      toggleLivePreview()
    }
    toast.success(`Default live preview ${enabled ? "enabled" : "disabled"}`)
  }

  const handleAutoSaveChange = (enabled: boolean) => {
    updateSetting("autoSaveToLocalStorage", enabled)
    toast.success(`Auto-save to localStorage ${enabled ? "enabled" : "disabled"}`)
  }

  const handleAddCDN = () => {
    if (!newCDN.trim()) {
      toast.error("Please enter a valid CDN URL")
      return
    }
    try {
      new URL(newCDN.trim()) // Validate URL
      addCustomCDN(newCDN.trim())
      setNewCDN("")
      toast.success("CDN added successfully")
    } catch {
      toast.error("Please enter a valid URL")
    }
  }

  const handleReset = () => {
    resetSettings()
    // Also reset theme and layout to defaults
    setTheme("system")
    setLayout("vertical", "preview-top")
    // Reset live preview if needed
    if (livePreview !== true) {
      toggleLivePreview()
    }
    toast.success("Settings reset to defaults")
  }

  const handleClearLocalStorage = () => {
    clearLocalStorage()
    setClearStorageOpen(false)
    toast.success("LocalStorage cleared successfully")
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label className="text-base font-semibold">Default Live Preview</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically enable live preview when the editor starts
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
          <Button
            variant={settings.defaultLivePreview ? "default" : "outline"}
            size="sm"
            onClick={() => handleLivePreviewChange(true)}
            className={cn("flex items-center gap-2", isMobile && "flex-1")}
          >
            <Eye className="w-4 h-4" />
            On
          </Button>
          <Button
            variant={!settings.defaultLivePreview ? "default" : "outline"}
            size="sm"
            onClick={() => handleLivePreviewChange(false)}
            className={cn("flex items-center gap-2", isMobile && "flex-1")}
          >
            <EyeOff className="w-4 h-4" />
            Off
          </Button>
        </div>
      </div>

      <Separator />

      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label className="text-base font-semibold">Default Theme</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose your preferred color theme
          </p>
        </div>
        <div className={cn(isMobile ? "w-full" : "w-48")}>
          {mounted && (
            <Select
              value={settings.defaultTheme}
              onValueChange={(value) => handleThemeChange(value as "light" | "dark" | "system")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Separator />

      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label className="text-base font-semibold">Auto-save to LocalStorage</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically save your code to browser localStorage
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
          <Button
            variant={settings.autoSaveToLocalStorage ? "default" : "outline"}
            size="sm"
            onClick={() => handleAutoSaveChange(true)}
            className={cn(isMobile && "flex-1")}
          >
            Enable
          </Button>
          <Button
            variant={!settings.autoSaveToLocalStorage ? "default" : "outline"}
            size="sm"
            onClick={() => handleAutoSaveChange(false)}
            className={cn(isMobile && "flex-1")}
          >
            Disable
          </Button>
        </div>
      </div>

      <Separator />

      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label className="text-base font-semibold">Website Color Scheme</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the primary color scheme for the entire website
          </p>
        </div>
        <div className={cn(isMobile ? "w-full" : "w-48")}>
          {mounted && (
            <Select
              value={settings.websiteColorScheme}
              onValueChange={(value) => updateSetting("websiteColorScheme", value as Settings["websiteColorScheme"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="pink">Pink</SelectItem>
                <SelectItem value="cyan">Cyan</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  )

  const renderEditorSettings = () => (
    <div className="space-y-6">
      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label htmlFor="fontSize" className="text-base font-semibold">
            Font Size
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust the editor font size (10-24px)
          </p>
        </div>
        <div className={cn(isMobile ? "w-full" : "w-32")}>
          <Input
            id="fontSize"
            type="number"
            min="10"
            max="24"
            value={settings.editorFontSize}
            onChange={(e) => updateSetting("editorFontSize", parseInt(e.target.value) || 14)}
          />
        </div>
      </div>

      <Separator />

      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label htmlFor="tabSize" className="text-base font-semibold">
            Tab Size
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Number of spaces for indentation (1-8)
          </p>
        </div>
        <div className={cn(isMobile ? "w-full" : "w-32")}>
          <Input
            id="tabSize"
            type="number"
            min="1"
            max="8"
            value={settings.editorTabSize}
            onChange={(e) => updateSetting("editorTabSize", parseInt(e.target.value) || 2)}
          />
        </div>
      </div>

      <Separator />

      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label className="text-base font-semibold">Word Wrap</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Enable word wrapping in the editor
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
          <Button
            variant={settings.editorWordWrap ? "default" : "outline"}
            size="sm"
            onClick={() => updateSetting("editorWordWrap", true)}
            className={cn(isMobile && "flex-1")}
          >
            Enable
          </Button>
          <Button
            variant={!settings.editorWordWrap ? "default" : "outline"}
            size="sm"
            onClick={() => updateSetting("editorWordWrap", false)}
            className={cn(isMobile && "flex-1")}
          >
            Disable
          </Button>
        </div>
      </div>

      <Separator />

      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label className="text-base font-semibold">Minimap</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Show code minimap in the editor
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
          <Button
            variant={settings.editorMinimap ? "default" : "outline"}
            size="sm"
            onClick={() => updateSetting("editorMinimap", true)}
            className={cn(isMobile && "flex-1")}
          >
            Show
          </Button>
          <Button
            variant={!settings.editorMinimap ? "default" : "outline"}
            size="sm"
            onClick={() => updateSetting("editorMinimap", false)}
            className={cn(isMobile && "flex-1")}
          >
            Hide
          </Button>
        </div>
      </div>
    </div>
  )

  const renderLayoutSettings = () => {
    const getLayoutOrientation = (position: Settings["defaultLayoutPosition"]) => {
      return position === "preview-top" || position === "preview-bottom" ? "vertical" : "horizontal"
    }

    return (
      <div className="space-y-6">
        <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
          <div className="flex-1">
            <Label className="text-base font-semibold">Default Layout Position</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Default preview position when the editor starts
            </p>
          </div>
          <div className={cn(isMobile && "w-full")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={cn("justify-start", isMobile ? "w-full" : "w-[280px]")}>
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  {settings.defaultLayoutPosition === "preview-top" && "Preview Top"}
                  {settings.defaultLayoutPosition === "preview-bottom" && "Preview Bottom"}
                  {settings.defaultLayoutPosition === "preview-left" && "Preview Left"}
                  {settings.defaultLayoutPosition === "preview-right" && "Preview Right"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isMobile ? "start" : "end"} className={cn(isMobile ? "w-[calc(100vw-3rem)]" : "w-[280px]")}>
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem
                    onClick={() => {
                      updateSetting("defaultLayoutPosition", "preview-top")
                      setLayout("vertical", "preview-top")
                    }}
                    className="flex items-center gap-3 p-3"
                  >
                    <Split className="w-4 h-4 text-muted-foreground rotate-90" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Preview Top</span>
                      <span className="text-xs text-muted-foreground">Editors at bottom</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      updateSetting("defaultLayoutPosition", "preview-bottom")
                      setLayout("vertical", "preview-bottom")
                    }}
                    className="flex items-center gap-3 p-3"
                  >
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Preview Bottom</span>
                      <span className="text-xs text-muted-foreground">Editors at top</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      updateSetting("defaultLayoutPosition", "preview-left")
                      setLayout("horizontal", "preview-left")
                    }}
                    className="flex items-center gap-3 p-3"
                  >
                    <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Preview Left</span>
                      <span className="text-xs text-muted-foreground">Editors on right</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      updateSetting("defaultLayoutPosition", "preview-right")
                      setLayout("horizontal", "preview-right")
                    }}
                    className="flex items-center gap-3 p-3"
                  >
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Preview Right</span>
                      <span className="text-xs text-muted-foreground">Editors on left</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    )
  }

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Label className="text-base font-semibold">Custom CDNs</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Add custom CDN links to include in your HTML projects (e.g., jQuery, Bootstrap)
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="https://cdn.example.com/library.js"
              value={newCDN}
              onChange={(e) => setNewCDN(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddCDN()
                }
              }}
            />
            <Button onClick={handleAddCDN} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {settings.customCDNs.length > 0 && (
            <div className="space-y-2">
              {settings.customCDNs.map((cdn, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                  <code className="flex-1 text-sm text-muted-foreground truncate">{cdn}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCustomCDN(index)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label className="text-base font-semibold">Reset Settings</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Reset all settings to their default values
          </p>
        </div>
        <div className={cn(isMobile && "w-full")}>
          <Button variant="destructive" onClick={handleReset} className={cn("flex items-center gap-2", isMobile && "w-full")}>
            <RotateCcw className="w-4 h-4" />
            Reset All Settings
          </Button>
        </div>
      </div>

      <Separator />

      <div className={cn("gap-4", isMobile ? "flex flex-col" : "flex items-center justify-between")}>
        <div className="flex-1">
          <Label className="text-base font-semibold">Clear LocalStorage</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Clear all saved settings and files from browser localStorage
          </p>
        </div>
        <div className={cn(isMobile && "w-full")}>
          <Button variant="destructive" onClick={() => setClearStorageOpen(true)} className={cn("flex items-center gap-2", isMobile && "w-full")}>
            <Trash2 className="w-4 h-4" />
            Clear LocalStorage
          </Button>
        </div>
      </div>
    </div>
  )

  const renderAboutSettings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Upi Line Code Editor</h2>
            <p className="text-base text-muted-foreground mt-1">
              A powerful code editor with live preview for HTML, CSS, and JavaScript
            </p>
          </div>
        </div>
      </div>

      {/* Tailwind CSS Highlight Section */}
      <section className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                Built with Tailwind CSS
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                  CDN Included
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tailwind CSS is automatically available in your preview. Just use Tailwind classes directly in your HTML!
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Tailwind CSS v3</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>jQuery 3.7.1</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Auto-injected</span>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-primary/10">
            <p className="text-xs font-mono text-muted-foreground">
              <span className="text-primary">Example:</span> Use classes like <code className="px-1.5 py-0.5 rounded bg-muted text-xs">bg-blue-500</code>, <code className="px-1.5 py-0.5 rounded bg-muted text-xs">text-white</code>, <code className="px-1.5 py-0.5 rounded bg-muted text-xs">p-4</code> directly in your HTML
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Code className="w-4 h-4 text-primary" />
          </div>
          Getting Started
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs font-semibold text-primary">1</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Start by opening a file, folder, or ZIP archive using the "Open" menu in the header.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Edit your HTML, CSS, and JavaScript files in the editor tabs. Use Tailwind classes directly in your HTML!
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <span className="text-xs font-semibold text-primary">3</span>
            </div>
            <p className="text-sm text-muted-foreground">
              View your changes in real-time in the preview panel (when live preview is enabled).
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          Features
        </h3>
        <div className="grid gap-3">
          <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileCode className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1.5">File Management</h4>
              <p className="text-sm text-muted-foreground">
                Open individual files, entire folders, or ZIP archives. The editor automatically detects HTML, CSS, and JavaScript files.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1.5">Live Preview</h4>
              <p className="text-sm text-muted-foreground">
                Toggle live preview on/off. When enabled, changes are reflected automatically. When disabled, use CTRL+S to save and update the preview.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <LayoutGrid className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1.5">Flexible Layout</h4>
              <p className="text-sm text-muted-foreground">
                Change the layout to position the preview at the top, bottom, left, or right of the editors.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1.5">Image Support</h4>
              <p className="text-sm text-muted-foreground">
                Images from opened folders are automatically included and displayed in the preview.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1.5">Download Options</h4>
              <p className="text-sm text-muted-foreground">
                Download individual files (HTML, CSS, JS, SVG) or download the entire project as a ZIP archive with all resources properly linked, including Tailwind CSS CDN.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1.5">Theme Support</h4>
              <p className="text-sm text-muted-foreground">
                Switch between light, dark, and system themes. The editor theme automatically matches your preference.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1.5">Console Panel</h4>
              <p className="text-sm text-muted-foreground">
                View all console logs, errors, warnings, and debug messages from your JavaScript code. Supports console.log, console.error, console.warn, console.info, console.debug, and console.table. Toggle the console panel from the editor toolbar.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1.5">Responsive Device Preview</h4>
              <p className="text-sm text-muted-foreground">
                Test your design on different screen sizes. Toggle responsive mode from the header to enable device preview with presets for Mobile, Tablet, Laptop, and Desktop. Customize viewport dimensions or use preset breakpoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Keyboard className="w-4 h-4 text-primary" />
          </div>
          Keyboard Shortcuts
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <span className="text-sm text-muted-foreground">Save file (when live preview is off)</span>
            <kbd className="px-3 py-1.5 text-xs font-semibold bg-background border rounded-md shadow-sm">CTRL + S</kbd>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <span className="text-sm text-muted-foreground">Copy code</span>
            <kbd className="px-3 py-1.5 text-xs font-semibold bg-background border rounded-md shadow-sm">CTRL + C</kbd>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <span className="text-sm text-muted-foreground">Paste code</span>
            <kbd className="px-3 py-1.5 text-xs font-semibold bg-background border rounded-md shadow-sm">CTRL + V</kbd>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <span className="text-sm text-muted-foreground">Toggle console panel</span>
            <kbd className="px-3 py-1.5 text-xs font-semibold bg-background border rounded-md shadow-sm">Terminal button</kbd>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <span className="text-sm text-muted-foreground">Toggle responsive preview</span>
            <kbd className="px-3 py-1.5 text-xs font-semibold bg-background border rounded-md shadow-sm">Monitor button</kbd>
          </div>
        </div>
      </section>

      {/* Supported File Types */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Supported File Types</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">HTML</span>
          <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">CSS</span>
          <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">JavaScript</span>
          <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">SVG</span>
          <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">Images</span>
        </div>
      </section>

      {/* Tips */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Pro Tips</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              You can have multiple files of the same type open in separate tabs.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              At least one HTML file must always remain open.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              When opening folders or ZIP files, all HTML, CSS, and JS files in subdirectories are automatically imported.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              The preview automatically combines all CSS and JavaScript files.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Tailwind CSS and jQuery are automatically available</span> in the preview when editing HTML files. No setup required!
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Use the <span className="font-semibold text-foreground">console panel</span> to debug your JavaScript. All console methods (log, error, warn, info, debug, table) are captured and displayed.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Enable <span className="font-semibold text-foreground">responsive device preview</span> to test your design on different screen sizes. Use preset breakpoints or customize dimensions.
            </p>
          </div>
        </div>
      </section>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return renderGeneralSettings()
      case "editor":
        return renderEditorSettings()
      case "layout":
        return renderLayoutSettings()
      case "advanced":
        return renderAdvancedSettings()
      case "about":
        return renderAboutSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 flex flex-col",
        isMobile ? "max-w-full h-full m-0 rounded-none" : "max-w-4xl h-[85vh]"
      )}>
        <DialogHeader className={cn("border-b", isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-6 pb-4")}>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className={cn("flex flex-1 overflow-hidden", isMobile && "flex-col")}>
          {/* Sidebar Navigation */}
          {isMobile ? (
            <div className="border-b bg-muted/30 overflow-x-auto">
              <nav className="flex space-x-1 p-2">
                {SETTINGS_SECTIONS.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          ) : (
            <div className="w-64 border-r bg-muted/30 p-4 overflow-y-auto">
              <nav className="space-y-1">
                {SETTINGS_SECTIONS.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          )}
          {/* Content Area */}
          <div className={cn("flex-1 overflow-y-auto", isMobile ? "p-4" : "p-6")}>
            {renderContent()}
          </div>
        </div>
      </DialogContent>
      
      {/* Clear LocalStorage Confirmation Modal */}
      <AlertDialog open={clearStorageOpen} onOpenChange={setClearStorageOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              
              Clear LocalStorage
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all localStorage data? This will permanently remove all saved settings and files from your browser. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLocalStorage}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear LocalStorage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

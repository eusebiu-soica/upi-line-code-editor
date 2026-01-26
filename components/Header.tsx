"use client"

import * as React from "react"
import { LayoutIcon, EyeIcon, FileCode, Folder, FolderArchive, LayoutDashboard, Eye, EyeOff, LayoutGrid, Terminal, Monitor, Settings as SettingsIcon, Menu, Moon, Sun } from "lucide-react"

import { useIsMobile } from "@/hooks/use-nobile"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "./theme-toggle"
import { Download } from "./DownloadButton"
import Image from "next/image"
import logoWhite from '@/public/Logo-white.png'
import logoBlack from '@/public/Logo-black.png'
import { useTheme } from "next-themes"
import { InputGroupTooltip } from "./InputGroup"
import { useFiles } from "@/contexts/FileContext"
import { openFile, openFolder, openZip } from "@/lib/file-utils"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutOrientation, LayoutPosition } from "@/contexts/FileContext"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Split } from "lucide-react"
import { CompareCodeModal } from "@/components/CompareCodeModal"
import { Settings } from "@/components/Settings"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export function Header() {
  const isMobile = useIsMobile()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { openFile: addFile, openFiles: addFiles, livePreview, toggleLivePreview, addImage, layoutOrientation, layoutPosition, setLayout, showConsole, toggleConsole, viewportEnabled, toggleViewport } = useFiles()
  const [compareModalOpen, setCompareModalOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which logo to use based on theme
  const logo = React.useMemo(() => {
    if (!mounted) return logoBlack // Default to black during SSR
    const currentTheme = resolvedTheme || theme || "system"
    const isDark = currentTheme === "dark" || (currentTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    return isDark ? logoWhite : logoBlack
  }, [mounted, resolvedTheme, theme])

  const handleToggleLivePreview = () => {
    toggleLivePreview()
    if (livePreview) {
      toast.info("Live preview disabled. Use CTRL+S to save files.")
    } else {
      toast.success("Live preview enabled")
    }
  }

  const handleOpenFile = React.useCallback(async () => {
    try {
      const file = await openFile()
      if (file) {
        addFile(file)
      }
    } catch (error) {
      console.error("Error opening file:", error)
    }
  }, [addFile])

  const handleOpenFolder = React.useCallback(async () => {
    try {
      const { files, images } = await openFolder()
      if (files && files.length > 0) {
        addFiles(files)
        // Add images to context
        images.forEach((img) => addImage(img.path, img.dataUrl))
        const imageMsg = images.length > 0 ? ` and ${images.length} image(s)` : ""
        toast.success(`Opened ${files.length} file(s)${imageMsg} from folder`)
      } else {
        toast.info("No HTML, CSS, or JS files found in the folder")
      }
    } catch (error) {
      console.error("Error opening folder:", error)
      toast.error("Failed to open folder")
    }
  }, [addFiles, addImage])

  const handleOpenZip = React.useCallback(async () => {
    try {
      const { files, images } = await openZip()
      if (files && files.length > 0) {
        addFiles(files)
        // Add images to context
        images.forEach((img) => addImage(img.path, img.dataUrl))
        const imageMsg = images.length > 0 ? ` and ${images.length} image(s)` : ""
        toast.success(`Opened ${files.length} file(s)${imageMsg} from zip`)
      } else {
        toast.info("No HTML, CSS, or JS files found in the zip")
      }
    } catch (error) {
      console.error("Error opening zip:", error)
      toast.error("Failed to open zip file")
    }
  }, [addFiles, addImage])

  const openOptions: { title: string; description: string; icon: React.ReactNode; action: () => void }[] = [
    {
      title: "Open File",
      description: "Open a single file from your computer.",
      icon: <FileCode className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
      action: handleOpenFile,
    },
    {
      title: "Open Folder",
      description: "Open a folder and load its contents.",
      icon: <Folder className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
      action: handleOpenFolder,
    },
    {
      title: "Open Zip",
      description: "Open and extract a zip archive.",
      icon: <FolderArchive className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!"  />,
      action: handleOpenZip,
    },
  ]

  return (
    <div className="flex flex-row items-center justify-between w-full p-2 sm:p-4 px-3 sm:px-6 shadow-sm border-b bg-background gap-2 relative z-50">
      {/* Left section: Logo and Navigation (hidden on mobile) */}
      <div className="hidden md:flex gap-2 items-center shrink-0">
        <div className="mr-2 lg:mr-3">
          {mounted && (
            <Image 
              src={logo} 
              alt="Upi-Line Code Editor Logo" 
              width={35} 
              height={35} 
              className="w-8 h-9! lg:w-[35px] lg:h-[35px]"
              priority
              loading="eager"
            />
          )}
        </div>
        <NavigationMenu viewport={isMobile}>
          <NavigationMenuList className="flex-wrap">
            <NavigationMenuItem>
              <NavigationMenuTrigger>Open</NavigationMenuTrigger>
              <NavigationMenuContent className="p-1">
                <ul className="grid w-[270px] gap-2">
                  {openOptions.map((option) => (
                    <ListItem
                      key={option.title}
                      title={option.title}
                      onClick={option.action}
                      description={option.description}
                      icon={option.icon}
                    />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Button 
          variant="ghost" 
          className="hidden md:flex"
          onClick={() => setCompareModalOpen(true)}
          aria-label="Compare code using diff editor"
        >
          Compare the code
        </Button>
      </div>

      {/* Mobile menu button (only on mobile/tablet under 1024px) */}
      <div className="md:hidden flex items-center gap-2">
        {mounted && (
          <Image 
            src={logo} 
            alt="Upi-Line Code Editor Logo" 
            width={28} 
            height={28} 
            className="w-7 h-7"
            priority
            loading="eager"
          />
        )}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm">Open</NavigationMenuTrigger>
              <NavigationMenuContent className="p-1">
                <ul className="grid w-[270px] gap-2">
                  {openOptions.map((option) => (
                    <ListItem
                      key={option.title}
                      title={option.title}
                      onClick={option.action}
                      description={option.description}
                      icon={option.icon}
                    />
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Center section: Project name input */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
          <InputGroupTooltip type="text" tooltipText="This name will be used for the project folder name, zip file or svg file name." inputPlaceholder="Project name" />
        </div>
      </div>

      {/* Right section: Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Desktop/Tablet buttons */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 relative"
                onClick={handleToggleLivePreview}
                aria-label={livePreview ? "Disable live preview" : "Enable live preview"}
              >
                {livePreview ? <Eye className="w-4 h-4" aria-hidden="true" /> : <EyeOff className="w-4 h-4" aria-hidden="true" />}
                <Badge 
                  className={`absolute top-0 right-0 h-2 w-2 p-0 border-0 ${livePreview ? 'bg-green-500' : 'bg-red-500'}`}
                  variant="default"
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{livePreview ? "Disable live preview" : "Enable live preview"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={viewportEnabled ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={toggleViewport}
                aria-label={viewportEnabled ? "Disable responsive viewport" : "Enable responsive viewport"}
              >
                <Monitor className="w-4 h-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{viewportEnabled ? "Disable responsive viewport" : "Enable responsive viewport"}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenu >
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" aria-label="Change layout">
                    <LayoutGrid strokeWidth={2} className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change layout</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="center" className="w-[280px]">
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem
                  onClick={() => setLayout("vertical", "preview-top")}
                  className="flex items-center gap-3 p-3"
                >
                  <Split className="w-4 h-4 text-muted-foreground! hover:text-muted-foreground! rotate-90" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Preview Top</span>
                    <span className="text-xs text-muted-foreground! hover:text-muted-foreground!">Editors at bottom</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLayout("vertical", "preview-bottom")}
                  className="flex items-center gap-3 p-3"
                >
                  <ArrowDown className="w-4 h-4 text-muted-foreground! hover:text-muted-foreground!" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Preview Bottom</span>
                    <span className="text-xs text-muted-foreground! hover:text-muted-foreground!">Editors at top</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLayout("horizontal", "preview-left")}
                  className="flex items-center gap-3 p-3"
                >
                  <ArrowLeft className="w-4 h-4 text-muted-foreground! hover:text-muted-foreground!" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Preview Left</span>
                    <span className="text-xs text-muted-foreground! hover:text-muted-foreground!">Editors on right</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLayout("horizontal", "preview-right")}
                  className="flex items-center gap-3 p-3"
                >
                  <ArrowRight className="w-4 h-4 text-muted-foreground! hover:text-muted-foreground!" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Preview Right</span>
                    <span className="text-xs text-muted-foreground! hover:text-muted-foreground!">Editors on left</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setSettingsOpen(true)}
                aria-label="Open settings"
              >
                <SettingsIcon className="w-4 h-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>


        {/* Download button */}
        <div className="ml-1 sm:ml-2 lg:ml-6">
          <Download />
        </div>

        {/* Mobile: Drawer with menu, theme, and settings */}
        <div className="sm:hidden flex items-center gap-1 ml-3">
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
                <DrawerDescription>Access theme and settings</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                {/* Theme Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Theme</Label>
                  <div className="flex flex-col gap-2">
                    {mounted && (
                      <>
                        <Button
                          variant={(resolvedTheme || theme) === "light" ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => {
                            setTheme("light")
                            setDrawerOpen(false)
                          }}
                        >
                          <Sun className="w-4 h-4 mr-2" />
                          Light
                        </Button>
                        <Button
                          variant={(resolvedTheme || theme) === "dark" ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => {
                            setTheme("dark")
                            setDrawerOpen(false)
                          }}
                        >
                          <Moon className="w-4 h-4 mr-2" />
                          Dark
                        </Button>
                        <Button
                          variant={(resolvedTheme || theme) === "system" || ((resolvedTheme || theme) !== "light" && (resolvedTheme || theme) !== "dark") ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => {
                            setTheme("system")
                            setDrawerOpen(false)
                          }}
                        >
                          <Monitor className="w-4 h-4 mr-2" />
                          System
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {/* Settings Button */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Settings</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSettingsOpen(true)
                      setDrawerOpen(false)
                    }}
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Open Settings
                  </Button>
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Modals */}
      <CompareCodeModal open={compareModalOpen} onOpenChange={setCompareModalOpen} />
      <Settings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}

function ListItem({
  title,
  children,
  onClick,
  description,
  icon,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { title: string; onClick: () => void; description: string; icon: React.ReactNode }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild className="p-3">
      <button
        onClick={onClick}
        className="flex flex-row gap-4 items-start select-none rounded-md leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left"
        aria-label={title}
      >
          {icon}
          <div className="flex flex-col gap-1.5">
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
              {description}
            </p>
          </div>
        </button>
      </NavigationMenuLink>
    </li>
  )
}

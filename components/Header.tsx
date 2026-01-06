"use client"

import * as React from "react"
import { LayoutIcon, EyeIcon, FileCode, Folder, FolderArchive, Info, LayoutDashboard, Eye, EyeOff } from "lucide-react"

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
import logo from '@/assets/icon-512x512.png'
import { InputGroupTooltip } from "./InputGroup"
import { useFiles } from "@/contexts/FileContext"
import { openFile, openFolder, openZip } from "@/lib/file-utils"
import { toast } from "sonner"

export function Header() {
  const isMobile = useIsMobile()
  const { openFile: addFile, openFiles: addFiles, livePreview, toggleLivePreview, addImage } = useFiles()

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
      icon: <FileCode className="!w-4.5 !h-4.5" />,
      action: handleOpenFile,
    },
    {
      title: "Open Folder",
      description: "Open a folder and load its contents.",
      icon: <Folder className="!w-4.5 !h-4.5" />,
      action: handleOpenFolder,
    },
    {
      title: "Open Zip",
      description: "Open and extract a zip archive.",
      icon: <FolderArchive className="!w-4.5 !h-4.5"  />,
      action: handleOpenZip,
    },
  ]

  return (
    <div className="flex flex-row items-center justify-between w-full p-4 px-6 shadow-sm border-b bg-background">
      <div className="hidden md:flex gap-2">
        <div className="mr-6">
          <Image src={logo} alt="Upi-Line Logo" width={35} height={35} />
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
        <Button variant="ghost">Compare the code</Button>
      </div>
      <div className="flex-1 flex justify-center w-full">
        <InputGroupTooltip type="text" tooltipText="This name will be used for the project folder." inputPlaceholder="Project name" />
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleToggleLivePreview}
            title={livePreview ? "Disable live preview" : "Enable live preview"}
          >
            {livePreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon"><LayoutDashboard strokeWidth={2} /></Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon"><Info /></Button>
        </div>
      </div>
      <div className="ml-6">
        <Download />
      </div>
      
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

"use client"

import * as React from "react"
import { LayoutIcon, EyeIcon, FileCode, Folder, FolderArchive, Info } from "lucide-react"

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

const openOptions: { title: string; description: string; icon: React.ReactNode; action: () => void }[] = [
  {
    title: "Open File",
    description: "Open a single file from your computer.",
    icon: <FileCode className="!w-4.5 !h-4.5" />,
    action: () => {
      // Placeholder: Implement file opening logic
      console.log("Open File clicked");
    },
  },
  {
    title: "Open Folder",
    description: "Open a folder and load its contents.",
    icon: <Folder className="!w-4.5 !h-4.5" />,
    action: () => {
      // Placeholder: Implement folder opening logic
      console.log("Open Folder clicked");
    },
  },
  {
    title: "Open Zip",
    description: "Open and extract a zip archive.",
    icon: <FolderArchive className="!w-4.5 !h-4.5"  />,
    action: () => {
      // Placeholder: Implement zip opening logic
      console.log("Open Zip clicked");
    },
  },
]

export function Header() {
  const isMobile = useIsMobile()

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
          <Button variant="ghost" size="icon"><EyeIcon/></Button>
          <Button variant="ghost" size="icon"><LayoutIcon /></Button>
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

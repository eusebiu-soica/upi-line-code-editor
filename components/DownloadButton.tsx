"use client"

import * as React from "react"
import {
    Braces,
    ChevronDownIcon,
    CodeXml,
    FolderArchive,
    Smile,
    DownloadIcon,
    FileBraces,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const downloadOptions: { title: string; description: string; icon: React.ReactNode; action: () => void }[] = [
    {
        title: "Download the HTML file",
        description: "Download only the HTML file of the project.",
        icon: <CodeXml className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
        action: () => {
            console.log("Download HTML clicked");
        }
    },
    {
        title: "Download the CSS file",
        description: "Download only the CSS file of the project.",
        icon: <FileBraces className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
        action: () => {
            console.log("Download CSS clicked");
        }
    },
    {
        title: "Download the JavaScript file",
        description: "Download only the JavaScript file of the project.",
        icon: <Braces className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
        action: () => {
            console.log("Download JS clicked");
        }
    },
    {
        title: "Download as SVG file",
        description: "Download the HTML editor content as an SVG file.",
        icon: <Smile className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
        action: () => {
            console.log("Download SVG clicked");
        }
    }
]

// Download ZIP option (shown only on mobile)
const downloadZipOption = {
    title: "Download as ZIP",
    description: "Download all project files as a ZIP archive.",
    icon: <FolderArchive className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
    action: () => {
        console.log("Download ZIP clicked");
    }
}

export function Download() {
    return (
        <>
            {/* Desktop/Tablet version */}
            <div className="hidden sm:block">
                <ButtonGroup>
                    <Button variant="default" className="font-normal">Download code</Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" className="!pl-2">
                                <ChevronDownIcon />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[300px]">
                            <DropdownMenuGroup className="flex flex-col gap-3">
                                {downloadOptions.map((option) => (
                                    <ListItem
                                        key={option.title}
                                        title={option.title}
                                        description={option.description}
                                        icon={option.icon}
                                        onClick={option.action}
                                    />
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </ButtonGroup>
            </div>

            {/* Mobile version */}
            <div className="sm:hidden">
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default" size="icon" className="h-8 w-8">
                                    <DownloadIcon className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Download</p>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-[300px]">
                        <DropdownMenuGroup className="flex flex-col">
                            {downloadOptions.map((option) => (
                                <ListItem
                                    key={option.title}
                                    title={option.title}
                                    description={option.description}
                                    icon={option.icon}
                                    onClick={option.action}
                                />
                            ))}
                            {/* Download ZIP - only shown on mobile */}
                            <ListItem
                                key={downloadZipOption.title}
                                title={downloadZipOption.title}
                                description={downloadZipOption.description}
                                icon={downloadZipOption.icon}
                                onClick={downloadZipOption.action}
                            />
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}

function ListItem({
    title,
    description,
    icon,
    onClick,
}: React.ComponentPropsWithoutRef<"li"> & { title: string; description: string; icon: React.ReactNode; onClick: () => void }) {
    return (
        <DropdownMenuItem key={title}
            className="flex gap-4 items-start justify-start p-3"
            onClick={onClick}
        >
            {icon}
            <div className="flex flex-col items-start gap-1.5">

                <span className="text-sm font-medium leading-none">{title}</span>
                <span className="line-clamp-2 text-xs leading-snug text-muted-foreground! hover:text-muted-foreground!">
                    {description}
                </span>
            </div>
        </DropdownMenuItem>
    )
}
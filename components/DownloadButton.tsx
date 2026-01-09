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
import { useFiles } from "@/contexts/FileContext"
import { downloadHTML, downloadCSS, downloadJS, downloadSVG, downloadZIP } from "@/lib/download-utils"
import { toast } from "sonner"

export function Download() {
    const { files, images, projectName, getFilesByType } = useFiles()

    const handleDownloadHTML = React.useCallback(() => {
        try {
            const htmlFiles = getFilesByType("html")
            if (htmlFiles.length === 0) {
                toast.error("No HTML files to download")
                return
            }
            downloadHTML(htmlFiles, projectName, files, images)
            toast.success("HTML file downloaded successfully")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to download HTML file")
        }
    }, [getFilesByType, projectName, files, images])

    const handleDownloadCSS = React.useCallback(() => {
        try {
            const cssFiles = getFilesByType("css")
            if (cssFiles.length === 0) {
                toast.error("No CSS files to download")
                return
            }
            downloadCSS(cssFiles, projectName)
            toast.success("CSS file downloaded successfully")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to download CSS file")
        }
    }, [getFilesByType, projectName])

    const handleDownloadJS = React.useCallback(() => {
        try {
            const jsFiles = getFilesByType("js")
            if (jsFiles.length === 0) {
                toast.error("No JavaScript files to download")
                return
            }
            downloadJS(jsFiles, projectName)
            toast.success("JavaScript file downloaded successfully")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to download JavaScript file")
        }
    }, [getFilesByType, projectName])

    const handleDownloadSVG = React.useCallback(() => {
        try {
            const htmlFiles = getFilesByType("html")
            if (htmlFiles.length === 0) {
                toast.error("No HTML files to convert to SVG")
                return
            }
            downloadSVG(htmlFiles, projectName)
            toast.success("SVG file downloaded successfully")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to download SVG file")
        }
    }, [getFilesByType, projectName])

    const handleDownloadZIP = React.useCallback(async () => {
        try {
            if (files.length === 0) {
                toast.error("No files to download")
                return
            }
            await downloadZIP(files, images, projectName)
            toast.success("ZIP file downloaded successfully")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to download ZIP file")
        }
    }, [files, images, projectName])

    const downloadOptions: { title: string; description: string; icon: React.ReactNode; action: () => void }[] = [
        {
            title: "Download the HTML file",
            description: "Download only the HTML file of the project.",
            icon: <CodeXml className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
            action: handleDownloadHTML
        },
        {
            title: "Download the CSS file",
            description: "Download only the CSS file of the project.",
            icon: <FileBraces className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
            action: handleDownloadCSS
        },
        {
            title: "Download the JavaScript file",
            description: "Download only the JavaScript file of the project.",
            icon: <Braces className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
            action: handleDownloadJS
        },
        {
            title: "Download as SVG file",
            description: "Download the HTML editor content as an SVG file.",
            icon: <Smile className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
            action: handleDownloadSVG
        }
    ]

    // Download ZIP option (shown only on mobile)
    const downloadZipOption = {
        title: "Download as ZIP",
        description: "Download all project files as a ZIP archive.",
        icon: <FolderArchive className="w-4.5! h-4.5! text-muted-foreground! hover:text-muted-foreground!" />,
        action: handleDownloadZIP
    }
    return (
        <>
            {/* Desktop/Tablet version */}
            <div className="hidden sm:block">
                <ButtonGroup>
                    <Button variant="default" className="font-normal" onClick={handleDownloadZIP} aria-label="Download all project files as ZIP archive">Download code</Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" className="!pl-2" aria-label="More download options">
                                <ChevronDownIcon aria-hidden="true" />
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
                                <Button variant="default" size="icon" className="h-8 w-8" aria-label="Download code">
                                    <DownloadIcon className="w-4 h-4" aria-hidden="true" />
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
            aria-label={title}
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
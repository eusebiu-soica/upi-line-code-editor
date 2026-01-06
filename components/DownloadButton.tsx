"use client"

import {
    Braces,
    ChevronDownIcon,
    CodeXml,
    FolderArchive,
    PaintbrushVertical,
    Smile,
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

const downloadOptions: { title: string; description: string; icon: React.ReactNode; action: () => void }[] = [
    {
        title: "Download the HTML file",
        description: "Download only the HTML file of the project.",
        icon: <CodeXml className="!w-4.5 !h-4.5" />,
        action: () => {
            // Placeholder: Implement download as ZIP logic
            console.log("Download as ZIP clicked");
        }
    },
    {
        title: "Download the CSS file",
        description: "Download only the CSS file of the project.",
        icon: <PaintbrushVertical className="!w-4.5 !h-4.5" />,
        action: () => {
            // Placeholder: Implement download as ZIP logic
            console.log("Download as ZIP clicked");
        }
    },
    {
        title: "Download the JavaScript file",
        description: "Download only the JavaScript file of the project.",
        icon: <Braces className="!w-4.5 !h-4.5" />,
        action: () => {
            // Placeholder: Implement download as ZIP logic
            console.log("Download as ZIP clicked");
        }
    },
    {
        title: "Download as SVG file",
        description: "Download the HTML editor content as an SVG file.",
        icon: <Smile className="!w-4.5 !h-4.5" />,
        action: () => {
            // Placeholder: Implement download as ZIP logic
            console.log("Download as ZIP clicked");
        }
    }
]

export function Download() {
    return (
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
                    {/* <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem variant="destructive">
                            <TrashIcon />
                            Delete Conversation
                        </DropdownMenuItem>
                    </DropdownMenuGroup> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
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
                <span className="line-clamp-2 text-xs leading-snug !text-muted-foreground !hover:text-muted-foreground">
                    {description}
                </span>
            </div>
        </DropdownMenuItem>
    )
}
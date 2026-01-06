"use client"

import * as React from "react"
import { X, Copy, ClipboardPaste, Trash2 } from "lucide-react"
import { useFiles, type EditorFile } from "@/contexts/FileContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function EditorTabs() {
  const { files, activeFileId, setActiveFile, closeFile, getFileById, updateFileContent } = useFiles()

  const handleTabClick = (fileId: string) => {
    setActiveFile(fileId)
  }

  const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    // Check if this is the last HTML file
    const htmlFiles = files.filter((f) => f.type === "html")
    const file = files.find((f) => f.id === fileId)
    
    if (file?.type === "html" && htmlFiles.length === 1) {
      // Don't allow closing the last HTML file
      return
    }
    
    closeFile(fileId)
  }

  const handleCopyCode = async () => {
    const activeFile = getFileById(activeFileId || "")
    if (activeFile) {
      try {
        await navigator.clipboard.writeText(activeFile.content)
        toast.success("Code copied to clipboard")
      } catch (err) {
        toast.error("Failed to copy code")
        console.error("Failed to copy:", err)
      }
    }
  }

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (activeFileId) {
        updateFileContent(activeFileId, text)
        toast.success("Code pasted")
      }
    } catch (err) {
      toast.error("Failed to paste code")
      console.error("Failed to paste:", err)
    }
  }

  const handleClearEditor = () => {
    if (activeFileId) {
      const activeFile = getFileById(activeFileId)
      if (activeFile) {
        updateFileContent(activeFileId, "", false)
      }
    }
  }

  // Check if we can close the file (not the last HTML)
  const canCloseFile = (file: EditorFile) => {
    if (file.type !== "html") return true
    const htmlFiles = files.filter((f) => f.type === "html")
    return htmlFiles.length > 1
  }

  return (
    <div className="flex items-center justify-between gap-1 border-b bg-muted/30">
      <div className="flex items-center gap-1 overflow-x-auto flex-1">
        {files.map((file) => (
          <TabButton
            key={file.id}
            file={file}
            isActive={file.id === activeFileId}
            canClose={canCloseFile(file)}
            onClick={() => handleTabClick(file.id)}
            onClose={(e) => handleCloseTab(e, file.id)}
          />
        ))}
      </div>
      <div className="flex items-center gap-1 px-2 border-l">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClearEditor}
          title="Clear editor"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCopyCode}
          title="Copy code"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePasteCode}
          title="Paste code"
        >
          <ClipboardPaste className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function TabButton({
  file,
  isActive,
  canClose,
  onClick,
  onClose,
}: {
  file: EditorFile
  isActive: boolean
  canClose: boolean
  onClick: () => void
  onClose: (e: React.MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors",
        "hover:bg-muted/50",
        isActive
          ? "border-primary bg-background text-foreground"
          : "border-transparent text-muted-foreground"
      )}
    >
      <span className="truncate max-w-[150px]">{file.name}</span>
      {file.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      {canClose && (
        <div
          onClick={onClose}
          className="ml-1 p-0.5 rounded hover:bg-muted opacity-70 hover:opacity-100 cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              onClose(e as any)
            }
          }}
        >
          <X className="w-3 h-3" />
        </div>
      )}
    </button>
  )
}


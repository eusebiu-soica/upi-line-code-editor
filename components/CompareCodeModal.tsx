"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Clipboard, Trash2, CornerLeftDown, CornerRightDown } from "lucide-react"
import { toast } from "sonner"
import { DiffEditor } from "@monaco-editor/react" // Import direct
import { useTheme } from "next-themes"

interface CompareCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompareCodeModal({ open, onOpenChange }: CompareCodeModalProps) {
  const [leftCode, setLeftCode] = React.useState("")
  const [rightCode, setRightCode] = React.useState("")
  const [leftName, setLeftName] = React.useState("Code A")
  const [rightName, setRightName] = React.useState("Code B")
  const [isMounted, setIsMounted] = React.useState(false)
  const { resolvedTheme } = useTheme()

  // Only mount editor when dialog is actually open
  React.useEffect(() => {
    if (open) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => setIsMounted(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsMounted(false)
    }
  }, [open])

  // Reset content when modal closes
  React.useEffect(() => {
    if (!open) {
      // Reset after a delay to allow cleanup
      const timer = setTimeout(() => {
        setLeftCode("")
        setRightCode("")
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Setează tema corectă
  const monacoTheme = React.useMemo(() => {
    const theme = resolvedTheme || "system"
    return theme === "dark" ? "vs-dark" : "vs"
  }, [resolvedTheme])

  // Handlers simplificați - React va face update automat în editor via props
  const handlePasteLeft = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setLeftCode(text)
      toast.success("Pasted to left")
    } catch (error) {
      toast.error("Clipboard access denied")
    }
  }

  const handlePasteRight = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setRightCode(text)
      toast.success("Pasted to right")
    } catch (error) {
      toast.error("Clipboard access denied")
    }
  }

  const handleClear = () => {
    setLeftCode("")
    setRightCode("")
    toast.info("Editors cleared")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-full h-screen max-h-screen rounded-none flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-background">
          <div className="flex flex-col gap-4">
            <DialogTitle className="hidden">Code Comparison</DialogTitle>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full max-w-5xl mx-auto">
              {/* Left Controls */}
              <div className="flex-1 flex items-center gap-2 w-full">
                <CornerLeftDown className="w-5 h-5 text-muted-foreground shrink-0 mt-2.5" />
                <Input
                  value={leftName}
                  onChange={(e) => setLeftName(e.target.value)}
                  className="h-9"
                />
                <Button variant="outline" size="icon" onClick={handlePasteLeft} className="shrink-0">
                  <Clipboard className="w-4 h-4" />
                </Button>
              </div>

              {/* Center Clear */}
              <Button variant="destructive" size="icon" onClick={handleClear} className="shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>

              {/* Right Controls */}
              <div className="flex-1 flex items-center gap-2 w-full">
                <Button variant="outline" size="icon" onClick={handlePasteRight} className="shrink-0">
                  <Clipboard className="w-4 h-4" />
                </Button>
                <Input
                  value={rightName}
                  onChange={(e) => setRightName(e.target.value)}
                  className="h-9"
                />
                <CornerRightDown className="w-5 h-5 text-muted-foreground shrink-0 mt-2.5" />
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 w-full bg-background p-0">
          <div className="h-full w-full border rounded-none overflow-hidden">
            {isMounted ? (
              <DiffEditor
                key={`diff-editor-${open}`}
                height="100%"
                language=""
                original={leftCode || ""}
                modified={rightCode || ""}
                theme={monacoTheme}
                loading={<div className="p-4 text-center">Loading editor...</div>}
                options={{
                  renderSideBySide: true,
                  originalEditable: true,
                  automaticLayout: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  readOnly: false,
                  diffCodeLens: false,
                  enableSplitViewResizing: true,
                  ignoreTrimWhitespace: false,
                } as any}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="p-4 text-center text-muted-foreground">Loading editor...</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
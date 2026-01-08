"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clipboard, Trash2 } from "lucide-react"
import { toast } from "sonner"
import DiffEditor from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { useTheme } from "next-themes"

// Type guard to check if editor has diff editor methods
function isDiffEditor(editor: any): editor is editor.IStandaloneDiffEditor {
  return editor && 
         typeof editor.getOriginalEditor === 'function' && 
         typeof editor.getModifiedEditor === 'function'
}

interface CompareCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompareCodeModal({ open, onOpenChange }: CompareCodeModalProps) {
  const [leftCode, setLeftCode] = React.useState("")
  const [rightCode, setRightCode] = React.useState("")
  const [leftName, setLeftName] = React.useState("Code A")
  const [rightName, setRightName] = React.useState("Code B")
  const leftEditorRef = React.useRef<editor.IStandaloneDiffEditor | null>(null)
  const rightEditorRef = React.useRef<editor.IStandaloneDiffEditor | null>(null)
  const { resolvedTheme } = useTheme()

  const monacoTheme = React.useMemo(() => {
    if (typeof window === "undefined") return "vs"
    const theme = resolvedTheme || "system"
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      return "vs-dark"
    }
    return "vs"
  }, [resolvedTheme])

  const handlePasteLeft = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setLeftCode(text)
      toast.success("Code pasted to left editor")
    } catch (error) {
      toast.error("Failed to paste code")
    }
  }

  const handlePasteRight = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setRightCode(text)
      toast.success("Code pasted to right editor")
    } catch (error) {
      toast.error("Failed to paste code")
    }
  }

  const handleClear = () => {
    setLeftCode("")
    setRightCode("")
    toast.info("Editors cleared")
  }

  const handleEditorDidMount = (editorInstance: any) => {
    if (!editorInstance) return
    
    // Store the editor instance - it might be the diff editor or a wrapper
    leftEditorRef.current = editorInstance as editor.IStandaloneDiffEditor
    
    // Use multiple attempts to access the editor methods
    const tryAccessEditors = (attempts = 0) => {
      if (attempts > 10) {
        console.warn('Could not access diff editor methods after multiple attempts')
        return
      }
      
      try {
        // Check if this is actually a diff editor with the required methods
        if (isDiffEditor(leftEditorRef.current)) {
          const originalEditor = leftEditorRef.current.getOriginalEditor()
          const modifiedEditor = leftEditorRef.current.getModifiedEditor()
          
          if (originalEditor && modifiedEditor) {
            // Update state when original (left) editor changes
            originalEditor.onDidChangeModelContent(() => {
              try {
                const value = originalEditor.getValue()
                setLeftCode(value)
              } catch (e) {
                console.error('Error getting original editor value:', e)
              }
            })
            
            // Update state when modified (right) editor changes
            modifiedEditor.onDidChangeModelContent(() => {
              try {
                const value = modifiedEditor.getValue()
                setRightCode(value)
              } catch (e) {
                console.error('Error getting modified editor value:', e)
              }
            })
          }
        } else {
          // Retry after a short delay
          setTimeout(() => tryAccessEditors(attempts + 1), 50)
        }
      } catch (error) {
        // Retry after a short delay
        setTimeout(() => tryAccessEditors(attempts + 1), 50)
      }
    }
    
    // Start trying to access the editors
    requestAnimationFrame(() => {
      tryAccessEditors()
    })
  }
  
  // Update editor content when state changes (e.g., from paste)
  React.useEffect(() => {
    if (leftEditorRef.current && isDiffEditor(leftEditorRef.current)) {
      try {
        const originalEditor = leftEditorRef.current.getOriginalEditor()
        if (originalEditor && originalEditor.getValue() !== leftCode) {
          originalEditor.setValue(leftCode)
        }
      } catch (error) {
        console.error('Error updating original editor:', error)
      }
    }
  }, [leftCode])
  
  React.useEffect(() => {
    if (leftEditorRef.current && isDiffEditor(leftEditorRef.current)) {
      try {
        const modifiedEditor = leftEditorRef.current.getModifiedEditor()
        if (modifiedEditor && modifiedEditor.getValue() !== rightCode) {
          modifiedEditor.setValue(rightCode)
        }
      } catch (error) {
        console.error('Error updating modified editor:', error)
      }
    }
  }, [rightCode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Compare the Code</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4 p-6 overflow-hidden">
          {/* Top controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Left side controls */}
            <div className="flex-1 flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial flex gap-2 items-center w-full sm:w-auto">
                <Label htmlFor="left-name" className="whitespace-nowrap">Name:</Label>
                <Input
                  id="left-name"
                  value={leftName}
                  onChange={(e) => setLeftName(e.target.value)}
                  placeholder="Code A"
                  className="flex-1"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasteLeft}
                className="w-full sm:w-auto"
              >
                <Clipboard className="w-4 h-4 mr-2" />
                Paste
              </Button>
            </div>

            {/* Center clear button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>

            {/* Right side controls */}
            <div className="flex-1 flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial flex gap-2 items-center w-full sm:w-auto">
                <Label htmlFor="right-name" className="whitespace-nowrap">Name:</Label>
                <Input
                  id="right-name"
                  value={rightName}
                  onChange={(e) => setRightName(e.target.value)}
                  placeholder="Code B"
                  className="flex-1"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasteRight}
                className="w-full sm:w-auto"
              >
                <Clipboard className="w-4 h-4 mr-2" />
                Paste
              </Button>
            </div>
          </div>

          {/* Diff Editor */}
          <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
            <DiffEditor
              height="100%"
              language="html"
              original={leftCode}
              modified={rightCode}
              theme={monacoTheme}
              onMount={handleEditorDidMount}
              onChange={(value) => {
                // This handles changes to the modified (right) editor
                if (value !== undefined && value !== rightCode) {
                  setRightCode(value)
                }
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: false,
                renderSideBySide: true,
                enableSplitViewResizing: true,
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import * as React from "react"
import Editor from "@monaco-editor/react"
import { useFiles } from "@/contexts/FileContext"
import type { editor } from "monaco-editor"
import * as monaco from "monaco-editor"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "sonner"
import { useTheme } from "next-themes"

export function MonacoEditor() {
  const { files, activeFileId, updateFileContent, livePreview, saveFile } = useFiles()
  const { theme: appTheme, resolvedTheme } = useTheme()
  const activeFile = files.find((f) => f.id === activeFileId)
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null)
  const saveActionRef = React.useRef<monaco.IDisposable | null>(null)

  // Map app theme to Monaco theme
  const monacoTheme = React.useMemo(() => {
    const theme = resolvedTheme || appTheme || "system"
    if (theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      return "vs-dark"
    }
    return "vs"
  }, [appTheme, resolvedTheme])

  const handleSave = React.useCallback(() => {
    if (!livePreview && activeFileId) {
      saveFile(activeFileId)
      toast.success("File saved")
      return true
    } else if (livePreview) {
      toast.info("Live preview is enabled - changes are saved automatically")
      return false
    }
    return false
  }, [livePreview, activeFileId, saveFile])

  const handleEditorDidMount = React.useCallback((editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance
    
    // Remove existing save action if it exists
    if (saveActionRef.current) {
      saveActionRef.current.dispose()
    }
    
    // Add custom save action that overrides the default
    const saveAction = editorInstance.addAction({
      id: "custom-save",
      label: "Save",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
      ],
      run: () => {
        handleSave()
      }
    })
    
    saveActionRef.current = saveAction
  }, [handleSave])

  // Update action when livePreview or activeFileId changes
  React.useEffect(() => {
    if (editorRef.current && activeFileId) {
      // Remove old action
      if (saveActionRef.current) {
        saveActionRef.current.dispose()
      }
      
      // Add new action
      const saveAction = editorRef.current.addAction({
        id: "custom-save",
        label: "Save",
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS
        ],
        run: () => {
          handleSave()
        }
      })
      
      saveActionRef.current = saveAction
    }
    
    return () => {
      if (saveActionRef.current) {
        saveActionRef.current.dispose()
      }
    }
  }, [livePreview, activeFileId, handleSave])

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      // Only mark as dirty if live preview is disabled
      updateFileContent(activeFileId, value, !livePreview)
    }
  }

  // Also handle with useHotkeys as fallback for when editor doesn't have focus
  useHotkeys(
    "ctrl+s, meta+s",
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      handleSave()
      return false
    },
    { 
      enabled: !!activeFileId,
      preventDefault: true,
      enableOnFormTags: false
    }
  )

  // Add document-level listener to prevent browser save dialog
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        e.stopPropagation()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [handleSave])

  const getLanguage = () => {
    if (!activeFile) return "plaintext"
    switch (activeFile.type) {
      case "html":
        return "html"
      case "css":
        return "css"
      case "js":
        return "javascript"
      default:
        return "plaintext"
    }
  }

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No file selected</p>
      </div>
    )
  }

  return (
    <Editor
      height="100%"
      language={getLanguage()}
      value={activeFile.content}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      theme={monacoTheme}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
      }}
    />
  )
}



"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { useFiles } from "@/contexts/FileContext"
import { useSettings } from "@/contexts/SettingsContext"
import type { editor } from "monaco-editor"
import { useHotkeys } from "react-hotkeys-hook"
import { toast } from "sonner"
import { useTheme } from "next-themes"

// Aggressively lazy load Monaco Editor - only load when component is mounted and visible
// This prevents blocking LCP (Largest Contentful Paint)
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full text-muted-foreground bg-background">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-pulse text-sm">Loading editor...</div>
      </div>
    </div>
  ),
})

export function MonacoEditor() {
  const { files, activeFileId, updateFileContent, livePreview, saveFile } = useFiles()
  const { settings } = useSettings()
  const { theme: appTheme, resolvedTheme } = useTheme()
  const activeFile = files.find((f) => f.id === activeFileId)
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null)
  const saveActionRef = React.useRef<{ dispose: () => void } | null>(null)
  const [monacoModule, setMonacoModule] = React.useState<typeof import("monaco-editor") | null>(null)
  const [shouldLoadEditor, setShouldLoadEditor] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Defer Monaco Editor loading to improve LCP (Largest Contentful Paint)
  // Strategy: Load only after initial render + use Intersection Observer for visibility-based loading
  React.useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return

    let mounted = true

    // Use Intersection Observer to load when component is about to be visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && mounted && !shouldLoadEditor) {
            // Load Monaco when visible, but defer slightly to not block initial paint
            const loadMonaco = () => {
              if (!mounted) return
              setShouldLoadEditor(true)
              // Load monaco-editor module
              import("monaco-editor").then((monaco) => {
                if (mounted) {
                  setMonacoModule(monaco)
                }
              }).catch((err) => {
                console.error("Failed to load Monaco Editor:", err)
              })
            }

            // Use requestIdleCallback if available, otherwise setTimeout
            if ('requestIdleCallback' in window) {
              requestIdleCallback(loadMonaco, { timeout: 1000 })
            } else {
              setTimeout(loadMonaco, 100)
            }

            observer.disconnect()
          }
        })
      },
      { 
        rootMargin: "100px", // Start loading 100px before it's visible
        threshold: 0.01 // Trigger as soon as any part is visible
      }
    )

    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (mounted && containerRef.current) {
        observer.observe(containerRef.current)
      }
    })

    // Fallback: Load after 3 seconds even if not visible (for accessibility)
    // Increased timeout to give more time for initial render
    const fallbackTimer = setTimeout(() => {
      if (mounted && !shouldLoadEditor) {
        setShouldLoadEditor(true)
        import("monaco-editor").then((monaco) => {
          if (mounted) {
            setMonacoModule(monaco)
          }
        }).catch((err) => {
          console.error("Failed to load Monaco Editor:", err)
        })
        observer.disconnect()
      }
    }, 3000)

    return () => {
      mounted = false
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [shouldLoadEditor])

  // Map app theme to Monaco theme (automatically follows site theme)
  const monacoTheme = React.useMemo(() => {
    if (typeof window === "undefined") return "vs"
    const theme = resolvedTheme || appTheme || "system"
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
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
    
    if (!monacoModule) return
    
    // Remove existing save action if it exists
    if (saveActionRef.current) {
      saveActionRef.current.dispose()
    }
    
    // Add custom save action that overrides the default
    const saveAction = editorInstance.addAction({
      id: "custom-save",
      label: "Save",
      keybindings: [
        monacoModule.KeyMod.CtrlCmd | monacoModule.KeyCode.KeyS
      ],
      run: () => {
        handleSave()
      }
    })
    
    saveActionRef.current = saveAction
  }, [handleSave, monacoModule])

  // Update action when livePreview or activeFileId changes
  React.useEffect(() => {
    if (editorRef.current && activeFileId && monacoModule) {
      // Remove old action
      if (saveActionRef.current) {
        saveActionRef.current.dispose()
      }
      
      // Add new action
      const saveAction = editorRef.current.addAction({
        id: "custom-save",
        label: "Save",
        keybindings: [
          monacoModule.KeyMod.CtrlCmd | monacoModule.KeyCode.KeyS
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
  }, [livePreview, activeFileId, handleSave, monacoModule])

  // Debounce timer for live preview
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (livePreview) {
        // Debounce live preview updates (500ms delay)
        debounceTimerRef.current = setTimeout(() => {
          updateFileContent(activeFileId, value, false)
        }, 500)
      } else {
        // No debounce when live preview is disabled, mark as dirty immediately
        updateFileContent(activeFileId, value, true)
      }
    }
  }

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

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
      <div className="flex items-center justify-center h-full text-muted-foreground" role="status" aria-live="polite">
        <p>No file selected</p>
      </div>
    )
  }

  // Show lightweight placeholder until Monaco is ready to load
  // This prevents blocking LCP
  if (!shouldLoadEditor) {
    return (
      <div 
        ref={containerRef}
        role="region" 
        aria-label={`Code editor for ${activeFile.name}`} 
        className="h-full w-full bg-background border rounded"
      >
        <div className="h-full w-full p-4 font-mono text-sm overflow-auto">
          <pre className="whitespace-pre-wrap text-muted-foreground">
            {activeFile.content || "// Loading editor..."}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      role="region" 
      aria-label={`Code editor for ${activeFile.name}`} 
      className="h-full w-full"
    >
      <Editor
        height="100%"
        language={getLanguage()}
        value={activeFile.content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={monacoTheme}
        options={{
          minimap: { enabled: settings.editorMinimap },
          fontSize: settings.editorFontSize,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: settings.editorTabSize,
          wordWrap: settings.editorWordWrap ? "on" : "off",
        }}
      />
    </div>
  )
}



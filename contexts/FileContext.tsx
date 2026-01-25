"use client"

import * as React from "react"

export type FileType = "html" | "css" | "js" | "other"

export type LayoutOrientation = "vertical" | "horizontal"
export type LayoutPosition = "preview-top" | "preview-bottom" | "preview-left" | "preview-right"

export interface ViewportSize {
  width: number
  height: number
  label: string
}

export interface ConsoleLog {
  id: string
  type: "log" | "error" | "warn" | "info" | "debug" | "table"
  message: string
  timestamp: number
  data?: any[]
}

export interface EditorFile {
  id: string
  name: string
  path: string
  content: string
  type: FileType
  isDirty?: boolean
}

interface FileContextType {
  files: EditorFile[]
  activeFileId: string | null
  livePreview: boolean
  previewRefreshTrigger: number
  images: Map<string, string> // Map of image path -> base64 data URL
  layoutOrientation: LayoutOrientation
  layoutPosition: LayoutPosition
  projectName: string
  consoleLogs: ConsoleLog[]
  viewportSize: ViewportSize
  showConsole: boolean
  viewportEnabled: boolean
  openFile: (file: EditorFile) => void
  openFiles: (files: EditorFile[]) => void
  closeFile: (fileId: string) => void
  updateFileContent: (fileId: string, content: string, markDirty?: boolean) => void
  setActiveFile: (fileId: string) => void
  getFileById: (fileId: string) => EditorFile | undefined
  getFilesByType: (type: FileType) => EditorFile[]
  clearAllFiles: () => void
  toggleLivePreview: () => void
  saveFile: (fileId: string) => void
  refreshPreview: () => void
  addImage: (path: string, dataUrl: string) => void
  getImage: (path: string) => string | undefined
  setLayout: (orientation: LayoutOrientation, position: LayoutPosition) => void
  setProjectName: (name: string) => void
  addConsoleLog: (log: ConsoleLog) => void
  clearConsoleLogs: () => void
  setViewportSize: (size: ViewportSize) => void
  toggleConsole: () => void
  toggleViewport: () => void
}

const FileContext = React.createContext<FileContextType | undefined>(undefined)

const FILES_STORAGE_KEY = "upi-line-editor-files"

export function FileProvider({ children }: { children: React.ReactNode }) {
  // Load files from localStorage if auto-save is enabled (check directly, not via settings context)
  const loadFilesFromStorage = React.useCallback((): EditorFile[] | null => {
    if (typeof window === "undefined") {
      return null
    }
    
    try {
      // Check if auto-save is enabled in localStorage
      const settingsStored = localStorage.getItem("upi-line-editor-settings")
      if (settingsStored) {
        const settings = JSON.parse(settingsStored)
        if (!settings.autoSaveToLocalStorage) {
          return null
        }
      } else {
        return null
      }
      
      const stored = localStorage.getItem(FILES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (error) {
      console.error("Failed to load files from localStorage:", error)
    }
    
    return null
  }, [])

  const [files, setFiles] = React.useState<EditorFile[]>(() => {
    const storedFiles = loadFilesFromStorage()
    if (storedFiles) {
      return storedFiles
    }
    
    // Initialize with default HTML, CSS, JS tabs
    // Initialize with default HTML, CSS, JS tabs
    return [
      {
        id: "default-html",
        name: "index.html",
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upi Line | Document</title>
    
</head>
<body>
     <h1 style="font-family: Helvetica">Hello Upi :)</h1>
</body>
</html>`,
        type: "html",
      },
      {
        id: "default-css",
        name: "style.css",
        path: "style.css",
        content: "/* Write your CSS code here */",
        type: "css",
      },
      {
        id: "default-js",
        name: "script.js",
        path: "script.js",
        content: `//Write your JavaScript code here`,
        type: "js",
      },
    ]
  })
  const [activeFileId, setActiveFileId] = React.useState<string | null>(() => {
    const storedFiles = loadFilesFromStorage()
    if (storedFiles && storedFiles.length > 0) {
      return storedFiles[0].id
    }
    return "default-html"
  })
  const [livePreview, setLivePreview] = React.useState<boolean>(true)
  const [previewRefreshTrigger, setPreviewRefreshTrigger] = React.useState(0)
  const [images, setImages] = React.useState<Map<string, string>>(new Map())
  const [layoutOrientation, setLayoutOrientation] = React.useState<LayoutOrientation>("vertical")
  const [layoutPosition, setLayoutPosition] = React.useState<LayoutPosition>("preview-top")
  const [projectName, setProjectName] = React.useState<string>("upi-line-new-project")
  const [consoleLogs, setConsoleLogs] = React.useState<ConsoleLog[]>([])
  const [viewportSize, setViewportSize] = React.useState<ViewportSize>({
    width: 1920,
    height: 1080,
    label: "Desktop (Full HD)",
  })
  const [showConsole, setShowConsole] = React.useState<boolean>(false)
  const [viewportEnabled, setViewportEnabled] = React.useState<boolean>(false)

  // Save files to localStorage when auto-save is enabled
  React.useEffect(() => {
    if (typeof window === "undefined") return
    
    try {
      const settingsStored = localStorage.getItem("upi-line-editor-settings")
      if (settingsStored) {
        const settings = JSON.parse(settingsStored)
        if (settings.autoSaveToLocalStorage) {
          localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files))
        }
      }
    } catch (error) {
      console.error("Failed to save files to localStorage:", error)
    }
  }, [files])

  const openFile = React.useCallback((file: EditorFile) => {
    setFiles((prev) => {
      // Create a unique identifier for the file (using full path if available, otherwise name)
      const fileKey = file.path ? `${file.path}/${file.name}` : file.name
      
      // Check if file already exists by unique key
      const existing = prev.find((f) => {
        const existingKey = f.path ? `${f.path}/${f.name}` : f.name
        return existingKey === fileKey
      })
      
      if (existing) {
        // Update existing file content and switch to it
        const updated = prev.map((f) =>
          f.id === existing.id ? { ...f, content: file.content, isDirty: false } : f
        )
        setActiveFileId(existing.id)
        return updated
      }

      // Check if there are any non-default files of the same type
      // If there are, we should always add a new tab (don't replace default)
      const nonDefaultFilesOfSameType = prev.filter(
        (f) => f.type === file.type && !f.id.startsWith("default-")
      )

      // Only replace default file if:
      // 1. There are no non-default files of this type yet (first file of this type)
      // 2. There's a default file of the same type
      // 3. It's not an "other" type
      if (nonDefaultFilesOfSameType.length === 0 && file.type !== "other") {
        const defaultFileOfSameType = prev.find(
          (f) => f.type === file.type && f.id.startsWith("default-")
        )

        if (defaultFileOfSameType) {
          // Replace the default file (first file of this type)
          const updated = prev.map((f) =>
            f.id === defaultFileOfSameType.id
              ? { ...file, id: defaultFileOfSameType.id } // Keep the same ID to maintain state
              : f
          )
          setActiveFileId(defaultFileOfSameType.id)
          return updated
        }
      }

      // Add new file as a new tab (multiple files of the same type are allowed)
      const newFiles = [...prev, file]
      setActiveFileId(file.id)
      return newFiles
    })
  }, [])

  // Batch open multiple files at once (handles state updates correctly)
  const openFiles = React.useCallback((newFiles: EditorFile[]) => {
    if (newFiles.length === 0) return
    
    setFiles((prev) => {
      let currentFiles = [...prev]
      let lastActiveId: string | null = null
      const replacedDefaults = new Set<string>() // Track which default files we've replaced

      for (const file of newFiles) {
        // Create a unique identifier for the file
        const fileKey = file.path ? `${file.path}/${file.name}` : file.name
        
        // Check if file already exists by unique key
        const existing = currentFiles.find((f) => {
          const existingKey = f.path ? `${f.path}/${f.name}` : f.name
          return existingKey === fileKey
        })
        
        if (existing) {
          // Update existing file content
          currentFiles = currentFiles.map((f) =>
            f.id === existing.id ? { ...f, content: file.content, isDirty: false } : f
          )
          lastActiveId = existing.id
          continue
        }

        // Check if there are any non-default files of the same type
        const nonDefaultFilesOfSameType = currentFiles.filter(
          (f) => f.type === file.type && !f.id.startsWith("default-")
        )

        if (
          nonDefaultFilesOfSameType.length === 0 && 
          file.type !== "other" &&
          !replacedDefaults.has(file.type)
        ) {
          const defaultFileOfSameType = currentFiles.find(
            (f) => f.type === file.type && f.id.startsWith("default-")
          )

          if (defaultFileOfSameType) {
            // Replace the default file (first file of this type)
            currentFiles = currentFiles.map((f) =>
              f.id === defaultFileOfSameType.id
                ? { ...file, id: defaultFileOfSameType.id } // Keep the same ID to maintain state
                : f
            )
            replacedDefaults.add(file.type)
            lastActiveId = defaultFileOfSameType.id
            continue
          }
        }

        // Add new file as a new tab (multiple files of the same type are allowed)
        currentFiles = [...currentFiles, file]
        lastActiveId = file.id
      }

      if (lastActiveId) {
        setActiveFileId(lastActiveId)
      }
      return currentFiles
    })
  }, [])

  const closeFile = React.useCallback((fileId: string) => {
    setFiles((prev) => {
      const fileToClose = prev.find((f) => f.id === fileId)
      // Don't allow closing the last HTML file
      if (fileToClose?.type === "html") {
        const htmlFiles = prev.filter((f) => f.type === "html")
        if (htmlFiles.length === 1) {
          return prev
        }
      }

      const filtered = prev.filter((f) => f.id !== fileId)
      // If we closed the active file, switch to another file
      if (fileId === activeFileId) {
        if (filtered.length > 0) {
          setActiveFileId(filtered[0].id)
        } else {
          setActiveFileId(null)
        }
      }
      return filtered
    })
  }, [activeFileId])

  const updateFileContent = React.useCallback((fileId: string, content: string, markDirty: boolean = true) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content, isDirty: markDirty ? true : f.isDirty } : f))
    )
  }, [])

  const saveFile = React.useCallback((fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isDirty: false } : f))
    )
    // Trigger preview refresh when saving
    setPreviewRefreshTrigger((prev) => prev + 1)
  }, [])

  const refreshPreview = React.useCallback(() => {
    setPreviewRefreshTrigger((prev) => prev + 1)
  }, [])

  const clearAllFiles = React.useCallback(() => {
    // Keep only the default HTML file
    const defaultHtml = files.find((f) => f.id === "default-html")
    if (defaultHtml) {
      setFiles([defaultHtml])
      setActiveFileId("default-html")
    } else {
      // If no default HTML, create one
      const newDefaultHtml: EditorFile = {
        id: "default-html",
        name: "index.html",
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upi Line | Document</title>
</head>
<body>
     <h1 style="font-family: Helvetica">Hello Upi :)</h1>
</body>
</html>`,
        type: "html",
      }
      setFiles([newDefaultHtml])
      setActiveFileId("default-html")
    }
  }, [files])

  const toggleLivePreview = React.useCallback(() => {
    setLivePreview((prev) => !prev)
  }, [])

  const setActiveFile = React.useCallback((fileId: string) => {
    setActiveFileId(fileId)
  }, [])

  const getFileById = React.useCallback(
    (fileId: string) => files.find((f) => f.id === fileId),
    [files]
  )

  const getFilesByType = React.useCallback(
    (type: FileType) => files.filter((f) => f.type === type),
    [files]
  )

  const addImage = React.useCallback((path: string, dataUrl: string) => {
    setImages((prev) => {
      const newMap = new Map(prev)
      newMap.set(path, dataUrl)
      return newMap
    })
  }, [])

  const getImage = React.useCallback((path: string) => {
    return images.get(path)
  }, [images])

  const setLayout = React.useCallback((orientation: LayoutOrientation, position: LayoutPosition) => {
    setLayoutOrientation(orientation)
    setLayoutPosition(position)
  }, [])

  const setProjectNameHandler = React.useCallback((name: string) => {
    setProjectName(name.trim() || "upi-line-new-project")
  }, [])

  const addConsoleLog = React.useCallback((log: ConsoleLog) => {
    setConsoleLogs((prev) => [...prev, log])
  }, [])

  const clearConsoleLogs = React.useCallback(() => {
    setConsoleLogs([])
  }, [])

  const setViewportSizeHandler = React.useCallback((size: ViewportSize) => {
    setViewportSize(size)
  }, [])

  const toggleConsole = React.useCallback(() => {
    setShowConsole((prev) => !prev)
  }, [])

  const toggleViewport = React.useCallback(() => {
    setViewportEnabled((prev) => !prev)
  }, [])

  const value = React.useMemo(
    () => ({
      files,
      activeFileId,
      livePreview,
      images,
      layoutOrientation,
      layoutPosition,
      projectName,
      consoleLogs,
      viewportSize,
      showConsole,
      viewportEnabled,
      openFile,
      openFiles,
      closeFile,
      updateFileContent,
      setActiveFile,
      getFileById,
      getFilesByType,
      clearAllFiles,
      toggleLivePreview,
      saveFile,
      refreshPreview,
      previewRefreshTrigger,
      addImage,
      getImage,
      setLayout,
      setProjectName: setProjectNameHandler,
      addConsoleLog,
      clearConsoleLogs,
      setViewportSize: setViewportSizeHandler,
      toggleConsole,
      toggleViewport,
    }),
    [files, activeFileId, livePreview, images, layoutOrientation, layoutPosition, projectName, consoleLogs, viewportSize, showConsole, viewportEnabled, openFile, openFiles, closeFile, updateFileContent, setActiveFile, getFileById, getFilesByType, clearAllFiles, toggleLivePreview, saveFile, refreshPreview, previewRefreshTrigger, addImage, getImage, setLayout, setProjectNameHandler, addConsoleLog, clearConsoleLogs, setViewportSizeHandler, toggleConsole, toggleViewport]
  )

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>
}

export function useFiles() {
  const context = React.useContext(FileContext)
  if (!context) {
    throw new Error("useFiles must be used within FileProvider")
  }
  return context
}

// Helper function to determine file type from extension
export function getFileTypeFromPath(path: string): FileType {
  const ext = path.split(".").pop()?.toLowerCase()
  if (ext === "html" || ext === "htm" || ext === "svg") return "html" // SVG files are treated as HTML
  if (ext === "css") return "css"
  if (ext === "js" || ext === "javascript") return "js"
  return "other"
}


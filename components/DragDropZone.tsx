"use client"

import * as React from "react"
import { useFiles } from "@/contexts/FileContext"
import { imageToDataUrl, readFileAsText, createEditorFileFromPath, isImageFile } from "@/lib/file-utils"
import { getFileTypeFromPath } from "@/contexts/FileContext"
import JSZip from "jszip"
import { toast } from "sonner"
import { Upload, Folder, FileArchive } from "lucide-react"

interface DragDropZoneProps {
  children: React.ReactNode
}

export function DragDropZone({ children }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragCounter, setDragCounter] = React.useState(0)
  const { openFiles, addImage } = useFiles()

  // Handle drag events
  const handleDragEnter = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => prev + 1)
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((prev) => {
      const newCounter = prev - 1
      if (newCounter === 0) {
        setIsDragging(false)
      }
      return newCounter
    })
  }, [])

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes("Files")) {
      e.dataTransfer.dropEffect = "copy"
    }
  }, [])

  // Process a single file
  const processSingleFile = async (file: File): Promise<{ files: any[]; images: any[] }> => {
    const files: any[] = []
    const images: any[] = []
    const ext = file.name.split(".").pop()?.toLowerCase()

    if (ext === "zip") {
      // Handle ZIP file
      try {
        const arrayBuffer = await file.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)
        
        const promises: Promise<void>[] = []
        
        zip.forEach((relativePath, zipFile) => {
          if (!zipFile.dir) {
            const fileExt = relativePath.split(".").pop()?.toLowerCase()
            if (fileExt === "html" || fileExt === "htm" || fileExt === "css" || fileExt === "js" || fileExt === "javascript" || fileExt === "svg") {
              promises.push(
                zipFile.async("string").then((content) => {
                  const fileName = relativePath.split('/').pop() || relativePath
                  files.push(createEditorFileFromPath(fileName, relativePath, content))
                })
              )
            } else if (isImageFile(relativePath)) {
              promises.push(
                zipFile.async("base64").then((base64) => {
                  const mimeTypes: Record<string, string> = {
                    jpg: "image/jpeg",
                    jpeg: "image/jpeg",
                    png: "image/png",
                    gif: "image/gif",
                    svg: "image/svg+xml",
                    webp: "image/webp",
                    bmp: "image/bmp",
                    ico: "image/x-icon"
                  }
                  const mimeType = mimeTypes[fileExt || ""] || "image/png"
                  const dataUrl = `data:${mimeType};base64,${base64}`
                  images.push({ path: relativePath, dataUrl })
                })
              )
            }
          }
        })
        
        // Wait for all async operations
        await Promise.all(promises)

        return { files, images }
      } catch (error) {
        console.error("Error processing ZIP:", error)
        toast.error("Failed to process ZIP file")
        return { files: [], images: [] }
      }
    } else if (ext === "html" || ext === "htm" || ext === "css" || ext === "js" || ext === "javascript" || ext === "svg") {
      // Handle code file
      const content = await readFileAsText(file)
      files.push({
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        path: file.name,
        content,
        type: getFileTypeFromPath(file.name),
      })
    } else if (isImageFile(file.name)) {
      // Handle image file
      const dataUrl = await imageToDataUrl(file)
      images.push({ path: file.name, dataUrl })
    }

    return { files, images }
  }

  // Process directory entry (for folders)
  const processEntry = async (
    entry: FileSystemEntry | null,
    basePath: string = "",
    files: any[] = [],
    images: any[] = []
  ): Promise<{ files: any[]; images: any[] }> => {
    if (!entry) return { files, images }

    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject)
      })

      const ext = file.name.split(".").pop()?.toLowerCase()
      const relativePath = basePath ? `${basePath}/${file.name}` : file.name

      if (ext === "html" || ext === "htm" || ext === "css" || ext === "js" || ext === "javascript" || ext === "svg") {
        const content = await readFileAsText(file)
        files.push(createEditorFileFromPath(file.name, relativePath, content))
      } else if (isImageFile(file.name)) {
        const dataUrl = await imageToDataUrl(file)
        images.push({ path: relativePath, dataUrl })
      }
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry
      const reader = dirEntry.createReader()
      const entries = await new Promise<FileSystemEntry[]>((resolve) => {
        const entries: FileSystemEntry[] = []
        const readEntries = () => {
          reader.readEntries((results) => {
            if (results.length === 0) {
              resolve(entries)
            } else {
              entries.push(...results)
              readEntries()
            }
          })
        }
        readEntries()
      })

      const dirName = entry.name
      const newBasePath = basePath ? `${basePath}/${dirName}` : dirName

      for (const subEntry of entries) {
        const result = await processEntry(subEntry, newBasePath, files, images)
        files = result.files
        images = result.images
      }
    }

    return { files, images }
  }

  const handleDrop = React.useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragCounter(0)

    const items = Array.from(e.dataTransfer.items)
    const files: any[] = []
    const images: any[] = []

    try {
      // Process all dropped items
      for (const item of items) {
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry()
          
          if (entry) {
            if (entry.isFile) {
              const fileEntry = entry as FileSystemFileEntry
              const file = await new Promise<File>((resolve, reject) => {
                fileEntry.file(resolve, reject)
              })
              
              const result = await processSingleFile(file)
              files.push(...result.files)
              images.push(...result.images)
            } else if (entry.isDirectory) {
              // Process directory recursively
              const result = await processEntry(entry, "", [], [])
              files.push(...result.files)
              images.push(...result.images)
            }
          } else {
            // Fallback: use file directly
            const file = item.getAsFile()
            if (file) {
              const result = await processSingleFile(file)
              files.push(...result.files)
              images.push(...result.images)
            }
          }
        }
      }

      // Open files and add images
      if (files.length > 0) {
        openFiles(files)
        toast.success(`Opened ${files.length} file${files.length > 1 ? 's' : ''}`)
      }

      if (images.length > 0) {
        images.forEach((img) => {
          addImage(img.path, img.dataUrl)
        })
        toast.success(`Added ${images.length} image${images.length > 1 ? 's' : ''}`)
      }

      if (files.length === 0 && images.length === 0) {
        toast.info("No supported files found")
      }
    } catch (error) {
      console.error("Error handling drop:", error)
      toast.error("Failed to process dropped files")
    }
  }, [openFiles, addImage])

  return (
    <div
      className="relative w-full h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-primary rounded-lg">
          <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-xl shadow-2xl border-2 border-primary">
            <div className="flex gap-4">
              <Upload className="w-12 h-12 text-primary animate-bounce" />
              <Folder className="w-12 h-12 text-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
              <FileArchive className="w-12 h-12 text-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Drop files here</h3>
              <p className="text-muted-foreground">
                Drop files, folders, or ZIP archives to open them
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


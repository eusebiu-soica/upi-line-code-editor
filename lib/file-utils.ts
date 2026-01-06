import { getFileTypeFromPath, type EditorFile } from "@/contexts/FileContext"
import JSZip from "jszip"

export interface ImageData {
  path: string
  dataUrl: string
}

// Check if a file is an image
export function isImageFile(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase()
  return ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"].includes(ext || "")
}

// Convert image file to base64 data URL
export async function imageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function createEditorFileFromFile(file: File, content: string, relativePath?: string): EditorFile {
  const path = relativePath || file.name
  const name = relativePath ? relativePath.split('/').pop() || file.name : file.name
  
  return {
    id: `file-${Date.now()}-${Math.random()}`,
    name: name,
    path: path,
    content,
    type: getFileTypeFromPath(name),
  }
}

export function createEditorFileFromPath(name: string, path: string, content: string): EditorFile {
  return {
    id: `file-${Date.now()}-${Math.random()}`,
    name: name,
    path: path,
    content,
    type: getFileTypeFromPath(name),
  }
}

export async function processFile(file: File): Promise<EditorFile> {
  const content = await readFileAsText(file)
  return createEditorFileFromFile(file, content)
}

export async function processFiles(files: FileList | File[]): Promise<EditorFile[]> {
  const fileArray = Array.from(files)
  const promises = fileArray
    .filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase()
      return ext === "html" || ext === "htm" || ext === "css" || ext === "js" || ext === "javascript"
    })
    .map(processFile)
  return Promise.all(promises)
}

// Recursively process directory entries
async function processDirectoryEntry(
  entry: any,
  basePath: string = "",
  files: EditorFile[] = [],
  images: ImageData[] = []
): Promise<{ files: EditorFile[]; images: ImageData[] }> {
  if (entry.kind === "file") {
    const file = await entry.getFile()
    const ext = file.name.split(".").pop()?.toLowerCase()
    const relativePath = basePath ? `${basePath}/${file.name}` : file.name
    
    if (ext === "html" || ext === "htm" || ext === "css" || ext === "js" || ext === "javascript") {
      const content = await readFileAsText(file)
      files.push(createEditorFileFromPath(file.name, relativePath, content))
    } else if (isImageFile(file.name)) {
      const dataUrl = await imageToDataUrl(file)
      images.push({ path: relativePath, dataUrl })
    }
  } else if (entry.kind === "directory") {
    const dirHandle = entry
    const dirName = entry.name
    const newBasePath = basePath ? `${basePath}/${dirName}` : dirName
    
    for await (const subEntry of dirHandle.values()) {
      const result = await processDirectoryEntry(subEntry, newBasePath, files, images)
      files = result.files
      images = result.images
    }
  }
  return { files, images }
}

// Handle folder opening (using File System Access API if available, fallback to input)
export async function openFolder(): Promise<{ files: EditorFile[]; images: ImageData[] }> {
  if ("showDirectoryPicker" in window) {
    try {
      const dirHandle = await (window as any).showDirectoryPicker()
      const files: EditorFile[] = []
      const images: ImageData[] = []

      // Recursively process all entries
      for await (const entry of dirHandle.values()) {
        const result = await processDirectoryEntry(entry, "", files, images)
        files.push(...result.files)
        images.push(...result.images)
      }

      return { files, images }
    } catch (error) {
      console.error("Error opening folder:", error)
      return { files: [], images: [] }
    }
  } else {
    // Fallback: use input element (webkitdirectory already includes subdirectories)
    return new Promise((resolve) => {
      const input = document.createElement("input")
      input.type = "file"
      input.webkitdirectory = true
      input.multiple = true
      input.onchange = async (e) => {
        const fileList = (e.target as HTMLInputElement).files || []
        const files: EditorFile[] = []
        const images: ImageData[] = []
        
        // Process all files (webkitdirectory includes subdirectories)
        for (const file of Array.from(fileList)) {
          const ext = file.name.split(".").pop()?.toLowerCase()
          // Use webkitRelativePath if available to preserve folder structure
          const relativePath = (file as any).webkitRelativePath || file.name
          
          if (ext === "html" || ext === "htm" || ext === "css" || ext === "js" || ext === "javascript") {
            const content = await readFileAsText(file)
            const fileName = relativePath.split('/').pop() || file.name
            files.push(createEditorFileFromPath(fileName, relativePath, content))
          } else if (isImageFile(file.name)) {
            const dataUrl = await imageToDataUrl(file)
            images.push({ path: relativePath, dataUrl })
          }
        }
        
        resolve({ files, images })
      }
      input.click()
    })
  }
}

export async function openFile(): Promise<EditorFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".html,.htm,.css,.js,.javascript"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const editorFile = await processFile(file)
        resolve(editorFile)
      } else {
        resolve(null)
      }
    }
    input.click()
  })
}

// Recursively extract files from zip
async function extractZipFiles(zip: JSZip): Promise<{ files: EditorFile[]; images: ImageData[] }> {
  const files: EditorFile[] = []
  const images: ImageData[] = []
  const promises: Promise<void>[] = []
  
  zip.forEach((relativePath, file) => {
    if (!file.dir) {
      const ext = relativePath.split(".").pop()?.toLowerCase()
      if (ext === "html" || ext === "htm" || ext === "css" || ext === "js" || ext === "javascript") {
        promises.push(
          file.async("string").then((content) => {
            const fileName = relativePath.split('/').pop() || relativePath
            files.push(createEditorFileFromPath(fileName, relativePath, content))
          })
        )
      } else if (isImageFile(relativePath)) {
        promises.push(
          file.async("base64").then((base64) => {
            // Determine MIME type from extension
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
            const mimeType = mimeTypes[ext || ""] || "image/png"
            const dataUrl = `data:${mimeType};base64,${base64}`
            images.push({ path: relativePath, dataUrl })
          })
        )
      }
    }
  })
  
  // Wait for all async operations to complete
  await Promise.all(promises)
  return { files, images }
}

// Handle zip file opening
export async function openZip(): Promise<{ files: EditorFile[]; images: ImageData[] }> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".zip"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        resolve({ files: [], images: [] })
        return
      }

      try {
        const arrayBuffer = await file.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)
        
        // Recursively extract all HTML, CSS, JS files and images
        const result = await extractZipFiles(zip)
        
        resolve(result)
      } catch (error) {
        console.error("Error opening zip:", error)
        reject(error)
      }
    }
    input.click()
  })
}


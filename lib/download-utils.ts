import JSZip from "jszip"
import type { EditorFile } from "@/contexts/FileContext"

/**
 * Sanitize filename to prevent directory traversal and invalid characters
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\?%*:|"<>]/g, "")
    .replace(/^\.+/, "") // Remove leading dots
    .trim() || "file"
}

/**
 * Download a single file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const sanitized = sanitizeFilename(filename)
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = sanitized
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download HTML file
 */
export function downloadHTML(htmlFiles: EditorFile[], projectName: string): void {
  if (htmlFiles.length === 0) {
    throw new Error("No HTML files to download")
  }
  
  // Use the first HTML file or combine all if multiple
  const content = htmlFiles.length === 1 
    ? htmlFiles[0].content 
    : htmlFiles.map(f => `<!-- ${f.name} -->\n${f.content}`).join("\n\n")
  
  const filename = htmlFiles.length === 1 
    ? htmlFiles[0].name 
    : `${projectName}.html`
  
  downloadFile(content, filename, "text/html")
}

/**
 * Download CSS file
 */
export function downloadCSS(cssFiles: EditorFile[], projectName: string): void {
  if (cssFiles.length === 0) {
    throw new Error("No CSS files to download")
  }
  
  // Combine all CSS files
  const content = cssFiles.map(f => `/* ${f.name} */\n${f.content}`).join("\n\n")
  const filename = cssFiles.length === 1 
    ? cssFiles[0].name 
    : `${projectName}.css`
  
  downloadFile(content, filename, "text/css")
}

/**
 * Download JavaScript file
 */
export function downloadJS(jsFiles: EditorFile[], projectName: string): void {
  if (jsFiles.length === 0) {
    throw new Error("No JavaScript files to download")
  }
  
  // Combine all JS files
  const content = jsFiles.map(f => `// ${f.name}\n${f.content}`).join("\n\n")
  const filename = jsFiles.length === 1 
    ? jsFiles[0].name 
    : `${projectName}.js`
  
  downloadFile(content, filename, "text/javascript")
}

/**
 * Download HTML content as SVG
 */
export function downloadSVG(htmlFiles: EditorFile[], projectName: string): void {
  if (htmlFiles.length === 0) {
    throw new Error("No HTML files to convert to SVG")
  }
  
  // Get the first HTML file content
  let htmlContent = htmlFiles[0].content
  
  // Remove XML declaration if present (it will be added by SVG wrapper)
  htmlContent = htmlContent.replace(/^<\?xml[^>]*\?>\s*/i, "")
  
  // Remove DOCTYPE if present (not needed in SVG foreignObject)
  htmlContent = htmlContent.replace(/^<!DOCTYPE[^>]*>\s*/i, "")
  
  // Remove <html>, <head>, and <body> tags but keep their content
  htmlContent = htmlContent.replace(/<\/?html[^>]*>/gi, "")
  htmlContent = htmlContent.replace(/<\/?head[^>]*>[\s\S]*?<\/head>/gi, "")
  htmlContent = htmlContent.replace(/<\/?body[^>]*>/gi, "")
  
  // Trim whitespace
  htmlContent = htmlContent.trim()
  
  // Create SVG wrapper with embedded HTML
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800" height="600">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      ${htmlContent}
    </div>
  </foreignObject>
</svg>`
  
  downloadFile(svgContent, `${projectName}.svg`, "image/svg+xml")
}

/**
 * Download all files as ZIP archive
 */
export async function downloadZIP(
  files: EditorFile[],
  images: Map<string, string>,
  projectName: string
): Promise<void> {
  if (files.length === 0) {
    throw new Error("No files to download")
  }
  
  const zip = new JSZip()
  
  // Add all code files
  for (const file of files) {
    const sanitizedPath = sanitizeFilename(file.path || file.name)
    zip.file(sanitizedPath, file.content)
  }
  
  // Add all images
  for (const [path, dataUrl] of images.entries()) {
    const sanitizedPath = sanitizeFilename(path)
    // Extract base64 data from data URL
    const base64Data = dataUrl.split(",")[1]
    if (base64Data) {
      zip.file(sanitizedPath, base64Data, { base64: true })
    }
  }
  
  // Generate ZIP file
  const blob = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${sanitizeFilename(projectName)}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


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
export function downloadHTML(
  htmlFiles: EditorFile[],
  projectName: string,
  allFiles?: EditorFile[],
  images?: Map<string, string>
): void {
  if (htmlFiles.length === 0) {
    throw new Error("No HTML files to download")
  }
  
  // Get the main HTML file
  const mainHtmlFile = htmlFiles[0]
  let htmlContent = mainHtmlFile.content
  
  // Get CSS and JS files if available
  const cssFiles = allFiles?.filter(f => f.type === "css") || []
  const jsFiles = allFiles?.filter(f => f.type === "js") || []
  
  // Remove any existing injected styles/scripts/CDN links
  htmlContent = htmlContent.replace(/<style id="combined-css">[\s\S]*?<\/style>/gi, "")
  htmlContent = htmlContent.replace(/<script id="combined-js">[\s\S]*?<\/script>/gi, "")
  htmlContent = htmlContent.replace(/<script[^>]*id="tailwind-cdn"[^>]*>[\s\S]*?<\/script>/gi, "")
  htmlContent = htmlContent.replace(/<script[^>]*id="jquery-cdn"[^>]*>[\s\S]*?<\/script>/gi, "")
  
  // Ensure we have a proper HTML structure
  if (!htmlContent.includes("<!DOCTYPE")) {
    htmlContent = "<!DOCTYPE html>\n" + htmlContent
  }
  
  // Add Tailwind CSS CDN
  const tailwindCDN = '<script id="tailwind-cdn" src="https://cdn.tailwindcss.com"></script>'
  
  // Add jQuery CDN
  const jqueryCDN = '<script id="jquery-cdn" src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>'
  
  // Combine all CSS files
  const combinedCSS = cssFiles.map(f => f.content).join("\n\n")
  
  // Combine all JS files
  const combinedJS = jsFiles.map(f => f.content).join("\n\n")
  
  // Process images if available
  if (images && images.size > 0) {
    // Replace image paths with data URLs in HTML
    for (const [originalPath, dataUrl] of images.entries()) {
      // Replace img src attributes
      htmlContent = htmlContent.replace(/<img([^>]*)\ssrc=["']([^"']+)["']/gi, (match, attrs, src) => {
        if (src === originalPath || src.includes(originalPath.split('/').pop() || originalPath)) {
          return `<img${attrs} src="${dataUrl}"`
        }
        return match
      })
      
      // Replace background-image in style attributes
      htmlContent = htmlContent.replace(/style=["']([^"']*background-image:\s*url\(["']?([^"')]+)["']?\)[^"']*)["']/gi, (match, styleContent, url) => {
        if (url === originalPath || url.includes(originalPath.split('/').pop() || originalPath)) {
          return `style="${styleContent.replace(url, dataUrl)}"`
        }
        return match
      })
    }
    
    // Replace image paths in CSS with data URLs
    if (combinedCSS) {
      let processedCSS = combinedCSS
      for (const [originalPath, dataUrl] of images.entries()) {
        processedCSS = processedCSS.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, url) => {
          const cleanUrl = url.split('?')[0].split('#')[0].trim()
          if (cleanUrl === originalPath || cleanUrl.includes(originalPath.split('/').pop() || originalPath)) {
            return `url("${dataUrl}")`
          }
          return match
        })
      }
      
      // Inject CSS in <head>
      if (htmlContent.includes("</head>")) {
        htmlContent = htmlContent.replace("</head>", `${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head>`)
      } else if (htmlContent.includes("<head>")) {
        htmlContent = htmlContent.replace("<head>", `<head>\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style>`)
      } else {
        if (htmlContent.includes("<html>")) {
          htmlContent = htmlContent.replace("<html>", `<html><head>\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head>`)
        } else {
          htmlContent = `<html><head>\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head><body>${htmlContent}</body></html>`
        }
      }
    } else {
      // No user CSS, but still add Tailwind
      if (htmlContent.includes("</head>")) {
        htmlContent = htmlContent.replace("</head>", `${tailwindCDN}\n</head>`)
      } else if (htmlContent.includes("<head>")) {
        htmlContent = htmlContent.replace("<head>", `<head>\n    ${tailwindCDN}`)
      } else {
        if (htmlContent.includes("<html>")) {
          htmlContent = htmlContent.replace("<html>", `<html><head>\n    ${tailwindCDN}\n</head>`)
        } else {
          htmlContent = `<html><head>\n    ${tailwindCDN}\n</head><body>${htmlContent}</body></html>`
        }
      }
    }
  } else {
    // No images, but still process CSS
    if (combinedCSS) {
      if (htmlContent.includes("</head>")) {
        htmlContent = htmlContent.replace("</head>", `${tailwindCDN}\n    <style id="combined-css">${combinedCSS}</style></head>`)
      } else if (htmlContent.includes("<head>")) {
        htmlContent = htmlContent.replace("<head>", `<head>\n    ${tailwindCDN}\n    <style id="combined-css">${combinedCSS}</style>`)
      } else {
        if (htmlContent.includes("<html>")) {
          htmlContent = htmlContent.replace("<html>", `<html><head>\n    ${tailwindCDN}\n    <style id="combined-css">${combinedCSS}</style></head>`)
        } else {
          htmlContent = `<html><head>\n    ${tailwindCDN}\n    <style id="combined-css">${combinedCSS}</style></head><body>${htmlContent}</body></html>`
        }
      }
    } else {
      // No user CSS, but still add Tailwind
      if (htmlContent.includes("</head>")) {
        htmlContent = htmlContent.replace("</head>", `${tailwindCDN}\n</head>`)
      } else if (htmlContent.includes("<head>")) {
        htmlContent = htmlContent.replace("<head>", `<head>\n    ${tailwindCDN}`)
      } else {
        if (htmlContent.includes("<html>")) {
          htmlContent = htmlContent.replace("<html>", `<html><head>\n    ${tailwindCDN}\n</head>`)
        } else {
          htmlContent = `<html><head>\n    ${tailwindCDN}\n</head><body>${htmlContent}</body></html>`
        }
      }
    }
  }
  
  // Inject JS files before </body>
  if (combinedJS) {
    if (htmlContent.includes("</body>")) {
      htmlContent = htmlContent.replace("</body>", `${jqueryCDN}\n    <script id="combined-js">${combinedJS}</script></body>`)
    } else if (htmlContent.includes("<body>")) {
      htmlContent = htmlContent.replace("<body>", `<body>\n    ${jqueryCDN}\n    <script id="combined-js">${combinedJS}</script>`)
    } else {
      if (htmlContent.includes("</html>")) {
        htmlContent = htmlContent.replace("</html>", `${jqueryCDN}\n    <script id="combined-js">${combinedJS}</script></html>`)
      } else {
        htmlContent = `${htmlContent}\n    ${jqueryCDN}\n    <script id="combined-js">${combinedJS}</script>`
      }
    }
  } else {
    // No user JS, but still add jQuery
    if (htmlContent.includes("</body>")) {
      htmlContent = htmlContent.replace("</body>", `${jqueryCDN}\n</body>`)
    } else if (htmlContent.includes("<body>")) {
      htmlContent = htmlContent.replace("<body>", `<body>\n    ${jqueryCDN}`)
    } else {
      if (htmlContent.includes("</html>")) {
        htmlContent = htmlContent.replace("</html>", `${jqueryCDN}\n</html>`)
      } else {
        htmlContent = `${htmlContent}\n    ${jqueryCDN}`
      }
    }
  }
  
  const filename = htmlFiles.length === 1 
    ? htmlFiles[0].name 
    : `${projectName}.html`
  
  downloadFile(htmlContent, filename, "text/html")
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
  
  // Separate files by type
  const htmlFiles = files.filter(f => f.type === "html")
  const cssFiles = files.filter(f => f.type === "css")
  const jsFiles = files.filter(f => f.type === "js")
  
  // Get the main HTML file (first one or default)
  const mainHtmlFile = htmlFiles[0]
  
  if (mainHtmlFile) {
    // Process HTML to include proper links to CSS/JS files
    let htmlContent = mainHtmlFile.content
    
    // Remove any existing injected styles/scripts
    htmlContent = htmlContent.replace(/<style id="combined-css">[\s\S]*?<\/style>/gi, "")
    htmlContent = htmlContent.replace(/<script id="combined-js">[\s\S]*?<\/script>/gi, "")
    
    // Ensure we have a proper HTML structure
    if (!htmlContent.includes("<!DOCTYPE")) {
      htmlContent = "<!DOCTYPE html>\n" + htmlContent
    }
    
    // Add CSS links in <head>
    if (cssFiles.length > 0) {
      const cssLinks = cssFiles.map(cssFile => {
        const cssPath = sanitizeFilename(cssFile.path || cssFile.name)
        return `    <link rel="stylesheet" href="${cssPath}">`
      }).join("\n")
      
      if (htmlContent.includes("</head>")) {
        htmlContent = htmlContent.replace("</head>", `${cssLinks}\n</head>`)
      } else if (htmlContent.includes("<head>")) {
        htmlContent = htmlContent.replace("<head>", `<head>\n${cssLinks}`)
      } else {
        // No head tag, add it
        if (htmlContent.includes("<html>")) {
          htmlContent = htmlContent.replace("<html>", `<html>\n<head>\n${cssLinks}\n</head>`)
        } else {
          htmlContent = `<!DOCTYPE html>\n<html>\n<head>\n${cssLinks}\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`
        }
      }
    }
    
    // Add JS script tags before </body>
    if (jsFiles.length > 0) {
      const jsScripts = jsFiles.map(jsFile => {
        const jsPath = sanitizeFilename(jsFile.path || jsFile.name)
        return `    <script src="${jsPath}"></script>`
      }).join("\n")
      
      if (htmlContent.includes("</body>")) {
        htmlContent = htmlContent.replace("</body>", `${jsScripts}\n</body>`)
      } else if (htmlContent.includes("<body>")) {
        htmlContent = htmlContent.replace("<body>", `<body>\n${jsScripts}`)
      } else {
        // No body tag, add it
        if (htmlContent.includes("</html>")) {
          htmlContent = htmlContent.replace("</html>", `${jsScripts}\n</html>`)
        } else {
          htmlContent = `${htmlContent}\n${jsScripts}`
        }
      }
    }
    
    // Replace image paths in HTML with relative paths
    if (images.size > 0) {
      for (const [originalPath, dataUrl] of images.entries()) {
        const imageFileName = sanitizeFilename(originalPath.split('/').pop() || originalPath)
        // Replace data URLs and original paths with the image filename
        htmlContent = htmlContent.replace(
          new RegExp(dataUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          imageFileName
        )
        htmlContent = htmlContent.replace(
          new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          imageFileName
        )
      }
    }
    
    // Replace image paths in CSS with relative paths
    for (const cssFile of cssFiles) {
      let cssContent = cssFile.content
      for (const [originalPath, dataUrl] of images.entries()) {
        const imageFileName = sanitizeFilename(originalPath.split('/').pop() || originalPath)
        // Replace data URLs and original paths
        cssContent = cssContent.replace(
          new RegExp(dataUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          imageFileName
        )
        cssContent = cssContent.replace(
          new RegExp(originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          imageFileName
        )
      }
      const sanitizedPath = sanitizeFilename(cssFile.path || cssFile.name)
      zip.file(sanitizedPath, cssContent)
    }
    
    // Add the processed HTML file
    const htmlPath = sanitizeFilename(mainHtmlFile.path || mainHtmlFile.name)
    zip.file(htmlPath, htmlContent)
  } else {
    // No HTML file, just add all files as-is
    for (const file of files) {
      const sanitizedPath = sanitizeFilename(file.path || file.name)
      zip.file(sanitizedPath, file.content)
    }
  }
  
  // Add remaining HTML files (if multiple)
  for (let i = 1; i < htmlFiles.length; i++) {
    const file = htmlFiles[i]
    const sanitizedPath = sanitizeFilename(file.path || file.name)
    zip.file(sanitizedPath, file.content)
  }
  
  // Add JS files
  for (const file of jsFiles) {
    const sanitizedPath = sanitizeFilename(file.path || file.name)
    zip.file(sanitizedPath, file.content)
  }
  
  // Add all images
  for (const [path, dataUrl] of images.entries()) {
    const imageFileName = sanitizeFilename(path.split('/').pop() || path)
    // Extract base64 data from data URL
    const base64Data = dataUrl.split(",")[1]
    if (base64Data) {
      zip.file(imageFileName, base64Data, { base64: true })
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


"use client"

import * as React from "react"
import { useFiles } from "@/contexts/FileContext"

export function Preview() {
  const { files, activeFileId, livePreview, previewRefreshTrigger, getFileById, images, getImage } = useFiles()
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  // Get HTML, CSS, and JS content
  // Use active HTML file if it exists and is HTML type, otherwise use first HTML file
  const activeFile = activeFileId ? getFileById(activeFileId) : null
  const htmlFile = activeFile?.type === "html" 
    ? activeFile 
    : files.find((f) => f.type === "html")
  
  // Get ALL CSS and JS files (they will be combined)
  const cssFiles = files.filter((f) => f.type === "css")
  const jsFiles = files.filter((f) => f.type === "js")

  // Combine all CSS files
  const combinedCSS = cssFiles.map((f) => f.content).join("\n\n")

  // Combine all JS files
  const combinedJS = jsFiles.map((f) => f.content).join("\n\n")

  // Create the preview HTML
  const previewHTML = React.useMemo(() => {
    if (!htmlFile) {
      return "<html><body><p>No HTML file found</p></body></html>"
    }

    let html = htmlFile.content

    // Replace image paths with data URLs in HTML
    if (images.size > 0) {
      // Replace img src attributes
      html = html.replace(/<img([^>]*)\ssrc=["']([^"']+)["']/gi, (match, attrs, src) => {
        const imageData = getImage(src) || getImage(src.split('/').pop() || src)
        if (imageData) {
          return `<img${attrs} src="${imageData}"`
        }
        return match
      })

      // Replace background-image in style attributes
      html = html.replace(/style=["']([^"']*background-image:\s*url\(["']?([^"')]+)["']?\)[^"']*)["']/gi, (match, styleContent, url) => {
        const imageData = getImage(url) || getImage(url.split('/').pop() || url)
        if (imageData) {
          return `style="${styleContent.replace(url, imageData)}"`
        }
        return match
      })
    }

    // Remove any previously added combined CSS/JS tags (to avoid duplicates on updates)
    html = html.replace(/<style id="combined-css">[\s\S]*?<\/style>/gi, "")
    html = html.replace(/<script id="combined-js">[\s\S]*?<\/script>/gi, "")

    // Always inject ALL CSS files (combine them all)
    if (combinedCSS) {
      // Replace image paths in CSS with data URLs
      let processedCSS = combinedCSS
      if (images.size > 0) {
        // Replace url() references in CSS
        processedCSS = processedCSS.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, url) => {
          // Remove query strings and fragments
          const cleanUrl = url.split('?')[0].split('#')[0].trim()
          const imageData = getImage(cleanUrl) || getImage(cleanUrl.split('/').pop() || cleanUrl)
          if (imageData) {
            return `url("${imageData}")`
          }
          return match
        })
      }

      // Try to find </head> or <head>
      if (html.includes("</head>")) {
        html = html.replace("</head>", `<style id="combined-css">${processedCSS}</style></head>`)
      } else if (html.includes("<head>")) {
        html = html.replace("<head>", `<head><style id="combined-css">${processedCSS}</style>`)
      } else {
        // No head tag, add it
        if (html.includes("<html>")) {
          html = html.replace("<html>", `<html><head><style id="combined-css">${processedCSS}</style></head>`)
        } else {
          html = `<html><head><style id="combined-css">${processedCSS}</style></head><body>${html}</body></html>`
        }
      }
    }

    // Always inject ALL JS files (combine them all)
    if (combinedJS) {
      // Try to find </body> or <body>
      if (html.includes("</body>")) {
        html = html.replace("</body>", `<script id="combined-js">${combinedJS}</script></body>`)
      } else if (html.includes("<body>")) {
        html = html.replace("<body>", `<body><script id="combined-js">${combinedJS}</script>`)
      } else {
        // No body tag, add it
        if (html.includes("</html>")) {
          html = html.replace("</html>", `<script id="combined-js">${combinedJS}</script></html>`)
        } else {
          html = `${html}<script id="combined-js">${combinedJS}</script>`
        }
      }
    }

    return html
  }, [htmlFile?.content, htmlFile?.id, combinedCSS, combinedJS, cssFiles.length, jsFiles.length, images, getImage])

  // Function to update iframe content
  const updateIframe = React.useCallback(() => {
    if (iframeRef.current && iframeRef.current.contentDocument) {
      iframeRef.current.contentDocument.open()
      iframeRef.current.contentDocument.write(previewHTML)
      iframeRef.current.contentDocument.close()
    }
  }, [previewHTML])

  // Track the last preview HTML to avoid unnecessary updates
  const lastPreviewHTMLRef = React.useRef<string>("")
  const lastTriggerRef = React.useRef<number>(0)
  const isInitialMountRef = React.useRef(true)

  // Initial load - update iframe once when component mounts
  React.useEffect(() => {
    if (isInitialMountRef.current && iframeRef.current && iframeRef.current.contentDocument) {
      updateIframe()
      lastPreviewHTMLRef.current = previewHTML
      isInitialMountRef.current = false
    }
  }, [previewHTML, updateIframe])

  // Update iframe content when live preview is enabled (auto-update)
  React.useEffect(() => {
    if (livePreview && previewHTML !== lastPreviewHTMLRef.current && !isInitialMountRef.current) {
      updateIframe()
      lastPreviewHTMLRef.current = previewHTML
    }
  }, [previewHTML, livePreview, updateIframe])

  // Update iframe when previewRefreshTrigger changes (manual refresh via CTRL+S)
  React.useEffect(() => {
    if (!livePreview && previewRefreshTrigger > lastTriggerRef.current) {
      updateIframe()
      lastTriggerRef.current = previewRefreshTrigger
      lastPreviewHTMLRef.current = previewHTML
    }
  }, [previewRefreshTrigger, livePreview, updateIframe, previewHTML])

  return (
    <div className="h-full w-full bg-background">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
}


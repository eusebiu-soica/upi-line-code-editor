"use client"

import * as React from "react"
import { useFiles } from "@/contexts/FileContext"

export function Preview() {
  const { files, activeFileId, livePreview, previewRefreshTrigger, getFileById, images, getImage } = useFiles()
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  // Get HTML, CSS, and JS content (memoized to avoid unnecessary recalculations)
  const htmlFile = React.useMemo(() => {
    const activeFile = activeFileId ? getFileById(activeFileId) : null
    return activeFile?.type === "html" 
      ? activeFile 
      : files.find((f) => f.type === "html")
  }, [activeFileId, getFileById, files])
  
  // Get ALL CSS and JS files (memoized to avoid unnecessary recalculations)
  const cssFiles = React.useMemo(() => 
    files.filter((f) => f.type === "css"),
    [files]
  )
  const jsFiles = React.useMemo(() => 
    files.filter((f) => f.type === "js"),
    [files]
  )

  // Combine all CSS files (memoized to avoid unnecessary recalculations)
  const combinedCSS = React.useMemo(() => 
    cssFiles.map((f) => f.content).join("\n\n"),
    [cssFiles]
  )

  // Combine all JS files (memoized to avoid unnecessary recalculations)
  const combinedJS = React.useMemo(() => 
    jsFiles.map((f) => f.content).join("\n\n"),
    [jsFiles]
  )

  // Create the preview HTML with XSS protection
  const previewHTML = React.useMemo(() => {
    if (!htmlFile) {
      return "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Preview</title></head><body><p>No HTML file found</p></body></html>"
    }

    let html = htmlFile.content
    
    // Security: Ensure DOCTYPE is present
    if (!html.includes("<!DOCTYPE")) {
      html = "<!DOCTYPE html>\n" + html
    }

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

    // Remove any previously added combined CSS/JS tags and CDN links (to avoid duplicates on updates)
    html = html.replace(/<style id="combined-css">[\s\S]*?<\/style>/gi, "")
    html = html.replace(/<script id="combined-js">[\s\S]*?<\/script>/gi, "")
    html = html.replace(/<script[^>]*id="tailwind-cdn"[^>]*>[\s\S]*?<\/script>/gi, "")
    html = html.replace(/<script[^>]*id="jquery-cdn"[^>]*>[\s\S]*?<\/script>/gi, "")

    // Add Tailwind CSS CDN (defer loading to improve performance)
    const tailwindCDN = '<script id="tailwind-cdn" src="https://cdn.tailwindcss.com" defer></script>'
    
    // Add jQuery CDN (defer loading to improve performance)
    const jqueryCDN = '<script id="jquery-cdn" src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous" defer></script>'

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
        html = html.replace("</head>", `${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head>`)
      } else if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style>`)
      } else {
        // No head tag, add it
        if (html.includes("<html>")) {
          html = html.replace("<html>", `<html><head>\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head>`)
        } else {
          html = `<html><head>\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head><body>${html}</body></html>`
        }
      }
    } else {
      // No user CSS, but still add Tailwind
      if (html.includes("</head>")) {
        html = html.replace("</head>", `${tailwindCDN}\n</head>`)
      } else if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>\n    ${tailwindCDN}`)
      } else {
        if (html.includes("<html>")) {
          html = html.replace("<html>", `<html><head>\n    ${tailwindCDN}\n</head>`)
        } else {
          html = `<html><head>\n    ${tailwindCDN}\n</head><body>${html}</body></html>`
        }
      }
    }

    // Always inject ALL JS files (combine them all)
    if (combinedJS) {
      // Try to find </body> or <body>
      if (html.includes("</body>")) {
        html = html.replace("</body>", `${jqueryCDN}\n    <script id="combined-js">${combinedJS}</script></body>`)
      } else if (html.includes("<body>")) {
        html = html.replace("<body>", `<body>\n    ${jqueryCDN}\n    <script id="combined-js">${combinedJS}</script>`)
      } else {
        // No body tag, add it
        if (html.includes("</html>")) {
          html = html.replace("</html>", `${jqueryCDN}\n    <script id="combined-js">${combinedJS}</script></html>`)
        } else {
          html = `${html}\n    ${jqueryCDN}\n    <script id="combined-js">${combinedJS}</script>`
        }
      }
    } else {
      // No user JS, but still add jQuery
      if (html.includes("</body>")) {
        html = html.replace("</body>", `${jqueryCDN}\n</body>`)
      } else if (html.includes("<body>")) {
        html = html.replace("<body>", `<body>\n    ${jqueryCDN}`)
      } else {
        if (html.includes("</html>")) {
          html = html.replace("</html>", `${jqueryCDN}\n</html>`)
        } else {
          html = `${html}\n    ${jqueryCDN}`
        }
      }
    }

    return html
  }, [htmlFile?.content, htmlFile?.id, combinedCSS, combinedJS, images, getImage, previewRefreshTrigger])

  // Function to update iframe content (optimized to reduce blocking)
  const updateIframe = React.useCallback(() => {
    if (iframeRef.current && iframeRef.current.contentDocument) {
      // Use requestAnimationFrame to avoid blocking main thread
      requestAnimationFrame(() => {
        if (iframeRef.current?.contentDocument) {
          iframeRef.current.contentDocument.open()
          iframeRef.current.contentDocument.write(previewHTML)
          iframeRef.current.contentDocument.close()
        }
      })
    }
  }, [previewHTML])

  // Track the last preview HTML to avoid unnecessary updates
  const lastPreviewHTMLRef = React.useRef<string>("")
  const lastTriggerRef = React.useRef<number>(0)
  const isInitialMountRef = React.useRef(true)

  // Initial load - defer iframe update to improve initial render
  React.useEffect(() => {
    if (isInitialMountRef.current && iframeRef.current) {
      // Defer initial iframe load to not block initial paint
      const loadIframe = () => {
        if (iframeRef.current?.contentDocument) {
          updateIframe()
          lastPreviewHTMLRef.current = previewHTML
          isInitialMountRef.current = false
        }
      }
      
      // Use requestIdleCallback if available, otherwise defer with setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadIframe, { timeout: 500 })
      } else {
        setTimeout(loadIframe, 100)
      }
    }
  }, [previewHTML, updateIframe])

  // Debounce timer for live preview updates
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Update iframe content when live preview is enabled (auto-update with debounce)
  React.useEffect(() => {
    if (livePreview && previewHTML !== lastPreviewHTMLRef.current && !isInitialMountRef.current) {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Debounce the update (500ms delay) - use requestIdleCallback for better performance
      const update = () => {
        updateIframe()
        lastPreviewHTMLRef.current = previewHTML
      }

      if ('requestIdleCallback' in window) {
        debounceTimerRef.current = setTimeout(() => {
          requestIdleCallback(update, { timeout: 500 })
        }, 500)
      } else {
        debounceTimerRef.current = setTimeout(update, 500)
      }
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
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
    <div className="h-full w-full bg-background" role="region" aria-label="Live preview of your code">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0 bg-white"
        title="Live preview of your code"
        sandbox="allow-scripts allow-same-origin"
        style={{ backgroundColor: 'white' }}
        loading="lazy"
        aria-label="Live preview iframe"
        // Performance: Reduce iframe rendering cost
        referrerPolicy="no-referrer"
      />
    </div>
  )
}


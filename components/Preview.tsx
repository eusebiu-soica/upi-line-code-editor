"use client"

import * as React from "react"
import { useFiles, type ConsoleLog } from "@/contexts/FileContext"
import { cn } from "@/lib/utils"

export function Preview() {
  const { files, activeFileId, livePreview, previewRefreshTrigger, getFileById, images, getImage, viewportSize, viewportEnabled, addConsoleLog, setViewportSize } = useFiles()
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const logIdCounterRef = React.useRef(0)
  const previewContainerRef = React.useRef<HTMLDivElement>(null)
  const isResizingRef = React.useRef(false)

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
    html = html.replace(/<script[^>]*id="console-capture"[^>]*>[\s\S]*?<\/script>/gi, "")

    // Console capture script - intercepts all console methods
    // Must be injected FIRST in <head> to catch all errors before user scripts run
    // Execute immediately and synchronously - no IIFE delay
    // Set up error handlers at the VERY TOP before anything else
    const consoleCaptureScript = `
      <script id="console-capture">
        // Prevent multiple initializations
        if (!window.__consoleCaptureInitialized) {
          window.__consoleCaptureInitialized = true;
          
          // Helper function to send messages to parent
          function sendToParent(type, message, ...args) {
            try {
              window.parent.postMessage({
                type: 'console',
                logType: type,
                message: String(message),
                data: args.map(arg => {
                  try {
                    return typeof arg === 'object' ? JSON.parse(JSON.stringify(arg)) : arg;
                  } catch {
                    return String(arg);
                  }
                }),
                timestamp: Date.now()
              }, '*');
            } catch (e) {
              // Silently fail if parent is not available
            }
          }

          // Filter out known non-user errors
          function shouldFilterError(message) {
            if (typeof message !== 'string') return false;
            // Filter Chrome extension errors
            if (message.includes('Could not establish connection') || 
                message.includes('Receiving end does not exist') ||
                message.includes('content-script')) {
              return true;
            }
            // Filter Vercel Analytics errors
            if (message.includes('Vercel Web Analytics') ||
                message.includes('_vercel/insights') ||
                message.includes('Failed to load script')) {
              return true;
            }
            // Filter Tailwind CDN warning
            if (message.includes('cdn.tailwindcss.com should not be used in production') ||
                message.includes('To use Tailwind CSS in production')) {
              return true;
            }
            return false;
          }

          // Track processed errors to avoid duplicates
          const processedErrors = new Set();
          
          function processError(errorName, errorMessage, source, lineno, colno, error, stack) {
            // Create unique key for this error to avoid duplicates
            const errorKey = (source || '') + ':' + (lineno || '') + ':' + (colno || '') + ':' + errorMessage;
            if (processedErrors.has(errorKey)) {
              return; // Already processed
            }
            processedErrors.add(errorKey);
            
            const fullMessage = errorName + ': ' + errorMessage;
            const location = 'at ' + (source || 'anonymous') + ':' + (lineno || '?') + ':' + (colno || '?');
            let formattedMessage = fullMessage + '\\n    ' + location;
            if (stack) {
              formattedMessage = formattedMessage + '\\n' + stack;
            }

            if (!shouldFilterError(errorMessage) && !shouldFilterError(fullMessage)) {
              sendToParent('error', formattedMessage, {
                filename: source,
                lineno: lineno,
                colno: colno,
                error: error || fullMessage,
                stack: stack
              });
            }
          }

          // SET UP ERROR HANDLERS IMMEDIATELY - BEFORE ANYTHING ELSE
          // This ensures we catch errors that occur during script execution
          window.onerror = function(message, source, lineno, colno, error) {
            const errorName = error ? (error.name || 'Error') : 'Error';
            const errorMessage = error ? (error.message || String(message)) : String(message);
            const stack = error && error.stack ? error.stack : undefined;
            processError(errorName, errorMessage, source, lineno, colno, error, stack);
            return false; // Don't prevent default - let it propagate
          };

          // Also use addEventListener as backup
          window.addEventListener('error', function(event) {
            if (event.error) {
              const error = event.error;
              const errorName = error.name || 'Error';
              const errorMessage = error.message || 'Unknown error';
              const stack = error.stack;
              processError(errorName, errorMessage, event.filename, event.lineno, event.colno, error, stack);
            } else if (event.message) {
              processError('Error', event.message, event.filename, event.lineno, event.colno, null, undefined);
            }
          }, true);

          // Store original console methods AFTER error handlers are set up
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          const originalInfo = console.info;
          const originalDebug = console.debug;
          const originalTable = console.table;

          // Set up promise rejection handler
          window.addEventListener('unhandledrejection', function(event) {
            const reason = event.reason;
            let reasonStr = 'Unknown rejection';
            
            if (reason) {
              if (reason instanceof Error) {
                reasonStr = reason.name + ': ' + reason.message;
                if (reason.stack) {
                  reasonStr = reasonStr + '\\n' + reason.stack;
                }
              } else {
                reasonStr = String(reason);
              }
            }
            
            if (!shouldFilterError(reasonStr)) {
              sendToParent('error', 'Unhandled Promise Rejection: ' + reasonStr, {
                reason: reasonStr
              });
            }
          }, true);

          // Override console methods AFTER error handlers are set up
          console.log = function(...args) {
            originalLog.apply(console, args);
            sendToParent('log', args[0], ...args.slice(1));
          };

          console.error = function(...args) {
            originalError.apply(console, args);
            sendToParent('error', args[0], ...args.slice(1));
          };

          console.warn = function(...args) {
            originalWarn.apply(console, args);
            // Filter Tailwind CDN warning before sending to parent
            const message = args[0] ? String(args[0]) : '';
            if (!shouldFilterError(message)) {
              sendToParent('warn', args[0], ...args.slice(1));
            }
          };

          console.info = function(...args) {
            originalInfo.apply(console, args);
            sendToParent('info', args[0], ...args.slice(1));
          };

          console.debug = function(...args) {
            originalDebug.apply(console, args);
            sendToParent('debug', args[0], ...args.slice(1));
          };

          console.table = function(data, columns) {
            originalTable.apply(console, arguments);
            // Send table data to parent - use first argument as the table data
            sendToParent('table', 'Table', [data]);
          };
        }
      </script>
    `

    // Add Tailwind CSS CDN (defer loading to improve performance)
    // Note: CDN version shows a warning in console - this is expected for dev/preview use
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

      // Inject console capture script FIRST in head to catch all errors
      // Must be the absolute first thing - inject before ANY existing head content
      if (html.includes("</head>")) {
        // Insert at the very beginning of head content (before any existing tags)
        const headMatch = html.match(/<head[^>]*>/);
        if (headMatch) {
          // Find position right after <head> tag
          const headPos = html.indexOf(headMatch[0]) + headMatch[0].length;
          html = html.slice(0, headPos) + consoleCaptureScript + '\n    ' + html.slice(headPos);
          // Then add CSS and Tailwind before </head>
          html = html.replace("</head>", `${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head>`)
        } else {
          html = html.replace("</head>", `${consoleCaptureScript}\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head>`)
        }
      } else if (html.includes("<head>")) {
        // Insert console capture script immediately after <head> tag
        html = html.replace("<head>", `<head>${consoleCaptureScript}\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style>`)
      } else {
        // No head tag, add it
        if (html.includes("<html>")) {
          html = html.replace("<html>", `<html><head>${consoleCaptureScript}\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head>`)
        } else {
          html = `<html><head>${consoleCaptureScript}\n    ${tailwindCDN}\n    <style id="combined-css">${processedCSS}</style></head><body>${html}</body></html>`
        }
      }
    } else {
      // No user CSS, but still add Tailwind and console capture
      // Must be the absolute first thing - inject before ANY existing head content
      if (html.includes("</head>")) {
        // Insert at the very beginning of head content (before any existing tags)
        const headMatch = html.match(/<head[^>]*>/);
        if (headMatch) {
          // Find position right after <head> tag
          const headPos = html.indexOf(headMatch[0]) + headMatch[0].length;
          html = html.slice(0, headPos) + consoleCaptureScript + '\n    ' + html.slice(headPos);
          // Then add Tailwind before </head>
          html = html.replace("</head>", `${tailwindCDN}\n</head>`)
        } else {
          html = html.replace("</head>", `${consoleCaptureScript}\n    ${tailwindCDN}\n</head>`)
        }
      } else if (html.includes("<head>")) {
        // Insert console capture script immediately after <head> tag
        html = html.replace("<head>", `<head>${consoleCaptureScript}\n    ${tailwindCDN}`)
      } else {
        if (html.includes("<html>")) {
          html = html.replace("<html>", `<html><head>${consoleCaptureScript}\n    ${tailwindCDN}\n</head>`)
        } else {
          html = `<html><head>${consoleCaptureScript}\n    ${tailwindCDN}\n</head><body>${html}</body></html>`
        }
      }
    }

    // Always inject ALL JS files (combine them all)
    // Note: console capture script is already in <head>, so we don't add it here
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

  // Refresh iframe when viewportEnabled or viewportSize changes to ensure content is visible
  const viewportWidthRef = React.useRef(viewportSize.width)
  const viewportHeightRef = React.useRef(viewportSize.height)
  const viewportEnabledRef = React.useRef(viewportEnabled)

  React.useEffect(() => {
    const viewportChanged = 
      viewportWidthRef.current !== viewportSize.width ||
      viewportHeightRef.current !== viewportSize.height ||
      viewportEnabledRef.current !== viewportEnabled

    if (viewportChanged) {
      viewportWidthRef.current = viewportSize.width
      viewportHeightRef.current = viewportSize.height
      viewportEnabledRef.current = viewportEnabled

      if (iframeRef.current && !isInitialMountRef.current) {
        // Small delay to ensure DOM is ready after viewport toggle/size change
        const timer = setTimeout(() => {
          if (iframeRef.current?.contentDocument) {
            updateIframe()
            lastPreviewHTMLRef.current = previewHTML
          }
        }, 150)
        return () => clearTimeout(timer)
      }
    }
  }, [viewportEnabled, viewportSize.width, viewportSize.height, updateIframe])

  // Handle resize for free resize mode
  React.useEffect(() => {
    if (viewportSize.label !== "Free Resize" || !previewContainerRef.current) {
      return
    }

    const container = previewContainerRef.current
    let resizeObserver: ResizeObserver | null = null

    // Use ResizeObserver to track size changes
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        if (isResizingRef.current) return
        
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          const newWidth = Math.round(width)
          const newHeight = Math.round(height)
          
          // Only update if size actually changed (avoid infinite loops)
          if (
            newWidth !== viewportSize.width ||
            newHeight !== viewportSize.height
          ) {
            isResizingRef.current = true
            setViewportSize({
              width: newWidth,
              height: newHeight,
              label: "Free Resize",
            })
            // Reset flag after a short delay
            setTimeout(() => {
              isResizingRef.current = false
            }, 100)
          }
        }
      })

      resizeObserver.observe(container)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [viewportSize.label, setViewportSize, viewportSize.width, viewportSize.height])

  // Listen for console messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from same origin (our iframe)
      if (event.data && event.data.type === 'console') {
        const log: ConsoleLog = {
          id: `log-${Date.now()}-${++logIdCounterRef.current}`,
          type: event.data.logType,
          message: event.data.message,
          timestamp: event.data.timestamp || Date.now(),
          data: event.data.data || [],
        }
        addConsoleLog(log)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [addConsoleLog])

  // Note: Console logs are preserved across preview refreshes
  // Users can manually clear them using the clear button in ConsolePanel

  return (
    <div 
      className={`h-full w-full bg-background flex flex-col items-center justify-center overflow-auto ${viewportEnabled ? 'p-4' : ''}`}
      role="region" 
      aria-label="Live preview of your code"
    >
      {viewportEnabled ? (
        <div 
          ref={previewContainerRef}
          className={cn(
            "bg-white border shadow-lg shrink-0 relative",
            viewportSize.label === "Free Resize" && "resize overflow-auto"
          )}
          style={{
            width: viewportSize.width > 0 ? `${Math.min(viewportSize.width, 3840)}px` : '100%',
            height: viewportSize.height > 0 ? `${Math.min(viewportSize.height, 2160)}px` : '100%',
            maxWidth: viewportSize.label === "Free Resize" ? '100%' : '100%',
            maxHeight: viewportSize.label === "Free Resize" ? '100%' : '100%',
            minWidth: viewportSize.label === "Free Resize" ? '320px' : 'auto',
            minHeight: viewportSize.label === "Free Resize" ? '240px' : 'auto',
            transition: viewportSize.label === "Free Resize" ? 'none' : 'width 0.2s ease, height 0.2s ease',
          }}
        >
          {viewportSize.label === "Free Resize" && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary/20 border border-primary/40 cursor-nwse-resize flex items-center justify-center">
              <div className="w-2 h-2 border-r border-b border-primary/60" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Live preview of your code"
            sandbox="allow-scripts allow-same-origin"
            style={{ backgroundColor: 'white' }}
            loading="lazy"
            aria-label="Live preview iframe"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0 bg-white"
          title="Live preview of your code"
          sandbox="allow-scripts allow-same-origin"
          style={{ backgroundColor: 'white' }}
          loading="lazy"
          aria-label="Live preview iframe"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  )
}


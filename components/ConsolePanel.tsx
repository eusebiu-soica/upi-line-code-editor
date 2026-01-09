"use client"

import * as React from "react"
import { X, Trash2, AlertCircle, Info, AlertTriangle, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
// Using native scroll instead of ScrollArea component
import { cn } from "@/lib/utils"

export type ConsoleLogType = "log" | "error" | "warn" | "info" | "debug" | "table"

export interface ConsoleLog {
  id: string
  type: ConsoleLogType
  message: string
  timestamp: number
  data?: any[]
}

interface ConsolePanelProps {
  logs: ConsoleLog[]
  onClear: () => void
  className?: string
}

export function ConsolePanel({ logs, onClear, className }: ConsolePanelProps) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [logs])

  const getLogIcon = (type: ConsoleLogType) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "warn":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      case "debug":
        return <Bug className="w-4 h-4 text-gray-500" />
      case "table":
        return <Info className="w-4 h-4 text-purple-500" />
      default:
        return <Info className="w-4 h-4 text-gray-400" />
    }
  }

  const getLogColor = (type: ConsoleLogType) => {
    switch (type) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      case "debug":
        return "text-gray-400"
      case "table":
        return "text-purple-400"
      default:
        return "text-foreground"
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const formatTableCell = (value: any): React.ReactNode => {
    if (value === null) {
      return <span className="text-muted-foreground">null</span>
    }
    if (value === undefined) {
      return <span className="text-muted-foreground">undefined</span>
    }
    const valueType = typeof value
    if (valueType === "string") {
      return <span className="text-blue-400">'{value}'</span>
    }
    if (valueType === "number") {
      return <span className="text-purple-400">{value}</span>
    }
    if (valueType === "boolean") {
      return <span className="text-purple-400">{String(value)}</span>
    }
    if (valueType === "object") {
      if (Array.isArray(value)) {
        return <span className="text-muted-foreground">Array({value.length})</span>
      }
      return <span className="text-muted-foreground">Object</span>
    }
    return <span>{String(value)}</span>
  }

  const renderTable = (tableData: any) => {
    // Handle nested arrays (data might be wrapped)
    let actualData = tableData
    if (Array.isArray(tableData) && tableData.length === 1 && Array.isArray(tableData[0])) {
      actualData = tableData[0]
    }
    
    if (typeof actualData !== "object" || actualData === null) {
      return <span>{String(actualData)}</span>
    }

    try {
      // If it's an array of objects, render as table with (index) column
      if (Array.isArray(actualData)) {
        if (actualData.length === 0) return <span>Empty table</span>
        
        const firstItem = actualData[0]
        if (typeof firstItem === "object" && firstItem !== null && !Array.isArray(firstItem)) {
          // Array of objects - create table with (index) column and object keys as columns
          // Get all unique keys from all objects
          const allKeys = new Set<string>()
          actualData.forEach((item: any) => {
            if (typeof item === "object" && item !== null) {
              Object.keys(item).forEach(key => allKeys.add(key))
            }
          })
          const headers = Array.from(allKeys)
          const allHeaders = ["(index)", ...headers]
          
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-border text-xs font-mono">
                <thead>
                  <tr className="bg-muted">
                    {allHeaders.map((header, idx) => (
                      <th key={idx} className="border border-border px-2 py-1 text-left font-semibold text-foreground">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {actualData.slice(0, 10).map((row: any, rowIdx: number) => (
                    <tr key={rowIdx} className="hover:bg-muted/50">
                      <td className="border border-border px-2 py-1 text-foreground">
                        {rowIdx}
                      </td>
                      {headers.map((header, colIdx) => (
                        <td key={colIdx} className="border border-border px-2 py-1">
                          {formatTableCell(row?.[header])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {actualData.length > 10 && (
                <div className="text-xs text-muted-foreground mt-1">
                  ... and {actualData.length - 10} more rows
                </div>
              )}
            </div>
          )
        } else if (Array.isArray(firstItem)) {
          // Array of arrays - use indices as headers
          const maxLength = Math.max(...actualData.map((arr: any[]) => arr?.length || 0))
          const headers = Array.from({ length: maxLength }, (_, i) => String(i))
          const allHeaders = ["(index)", ...headers]
          
          return (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-border text-xs font-mono">
                <thead>
                  <tr className="bg-muted">
                    {allHeaders.map((header, idx) => (
                      <th key={idx} className="border border-border px-2 py-1 text-left font-semibold text-foreground">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {actualData.slice(0, 10).map((row: any, rowIdx: number) => (
                    <tr key={rowIdx} className="hover:bg-muted/50">
                      <td className="border border-border px-2 py-1 text-foreground">
                        {rowIdx}
                      </td>
                      {headers.map((_, colIdx) => (
                        <td key={colIdx} className="border border-border px-2 py-1">
                          {formatTableCell(row?.[colIdx])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {actualData.length > 10 && (
                <div className="text-xs text-muted-foreground mt-1">
                  ... and {actualData.length - 10} more rows
                </div>
              )}
            </div>
          )
        }
      } else {
        // Single object - render as key-value table
        const entries = Object.entries(actualData)
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-border text-xs font-mono">
              <tbody>
                {entries.map(([key, value], idx) => (
                  <tr key={idx} className="hover:bg-muted/50">
                    <td className="border border-border px-2 py-1 font-semibold bg-muted text-foreground">
                      {String(key)}
                    </td>
                    <td className="border border-border px-2 py-1">
                      {formatTableCell(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    } catch (e) {
      // Fall through to default formatting
      console.error("Table rendering error:", e)
    }
    return <span>{JSON.stringify(actualData)}</span>
  }

  const formatMessage = (message: string, data?: any[], type?: ConsoleLogType) => {
    if (type === "table" && data && data.length > 0) {
      return renderTable(data[0])
    }
    
    if (!data || data.length === 0) return message
    
    // Try to format objects nicely
    const formattedData = data.map(item => {
      if (typeof item === "object") {
        try {
          return JSON.stringify(item, null, 2)
        } catch {
          return String(item)
        }
      }
      return String(item)
    }).join(" ")

    return `${message} ${formattedData}`
  }

  return (
    <div className={cn("flex flex-col h-full w-full bg-background", className)}>
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Console</h3>
          {logs.length > 0 && (
            <span className="text-xs text-muted-foreground">({logs.length})</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClear}
          aria-label="Clear console"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Console Logs */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            No console output yet
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={cn(
                "flex items-start gap-2 px-2 py-1 rounded hover:bg-muted/50 transition-colors",
                getLogColor(log.type)
              )}
            >
              <div className="mt-0.5 shrink-0">{getLogIcon(log.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] uppercase text-muted-foreground">{log.type}</span>
                </div>
                  <div className="wrap-break-word whitespace-pre-wrap">
                    {log.type === "table" && log.data && log.data.length > 0
                      ? renderTable(log.data[0])
                      : formatMessage(log.message, log.data, log.type)}
                  </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

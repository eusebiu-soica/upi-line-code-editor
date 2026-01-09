"use client"

import * as React from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import dynamic from "next/dynamic"
import { useFiles } from "@/contexts/FileContext"

// Aggressively lazy load all heavy components to improve Speed Index and LCP
const Preview = dynamic(() => import("./Preview").then(mod => ({ default: mod.Preview })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground bg-background">
      <div className="text-sm">Loading preview...</div>
    </div>
  ),
})

const EditorTabs = dynamic(() => import("./EditorTabs").then(mod => ({ default: mod.EditorTabs })), {
  ssr: false,
  loading: () => (
    <div className="h-10 border-b bg-muted/30 animate-pulse" />
  ),
})

// Lazy load MonacoEditor to prevent blocking initial render
const MonacoEditor = dynamic(() => import("./MonacoEditor").then(mod => ({ default: mod.MonacoEditor })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground bg-background">
      <div className="text-sm">Loading editor...</div>
    </div>
  ),
})

export function MainLayout() {
  const { layoutOrientation, layoutPosition } = useFiles()

  // Determine which panel comes first based on layout position
  const previewFirst = layoutPosition === "preview-top" || layoutPosition === "preview-left"
  
  const PreviewPanel = (
    <ResizablePanel defaultSize={40} minSize={20}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <Preview />
        </div>
      </div>
    </ResizablePanel>
  )

  const EditorPanel = (
    <ResizablePanel defaultSize={60} minSize={30}>
      <div className="flex flex-col h-full">
        <EditorTabs />
        <div className="flex-1 overflow-hidden">
          <MonacoEditor />
        </div>
      </div>
    </ResizablePanel>
  )

  return (
    <ResizablePanelGroup
      orientation={layoutOrientation}
      className="h-[calc(100vh-70px)] max-w-full rounded-lg md:min-w-[450px]"
    >
      {previewFirst ? (
        <>
          {PreviewPanel}
          <ResizableHandle />
          {EditorPanel}
        </>
      ) : (
        <>
          {EditorPanel}
          <ResizableHandle />
          {PreviewPanel}
        </>
      )}
    </ResizablePanelGroup>
  )
}

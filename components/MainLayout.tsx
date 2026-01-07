"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Preview } from "./Preview"
import { EditorTabs } from "./EditorTabs"
import { MonacoEditor } from "./MonacoEditor"
import { useFiles } from "@/contexts/FileContext"

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

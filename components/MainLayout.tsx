"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Preview } from "./Preview"
import { EditorTabs } from "./EditorTabs"
import { MonacoEditor } from "./MonacoEditor"

export function MainLayout() {
  return (
    <ResizablePanelGroup
      orientation="vertical"
      className="h-[calc(100vh-70px)] max-w-full rounded-lg md:min-w-[450px]"
    >
      {/* Preview Section (Top) */}
      <ResizablePanel defaultSize={40} minSize={20}>
        <div className="flex flex-col h-full">
          
          <div className="flex-1 overflow-hidden">
            <Preview />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      {/* Editor Section (Bottom) */}
      <ResizablePanel defaultSize={60} minSize={30}>
        <div className="flex flex-col h-full">
          <EditorTabs />
          <div className="flex-1 overflow-hidden">
            <MonacoEditor />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

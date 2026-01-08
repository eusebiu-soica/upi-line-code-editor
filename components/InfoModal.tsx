"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileCode, Folder, FolderArchive, Eye, EyeOff, Keyboard, Download, LayoutGrid, Palette, Code, Image as ImageIcon, Zap } from "lucide-react"

interface InfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InfoModal({ open, onOpenChange }: InfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Upi Line Code Editor
          </DialogTitle>
          <DialogDescription>
            A powerful code editor with live preview for HTML, CSS, and JavaScript
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Getting Started */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Getting Started
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Start by opening a file, folder, or ZIP archive using the "Open" menu in the header.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Edit your HTML, CSS, and JavaScript files in the editor tabs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>View your changes in real-time in the preview panel (when live preview is enabled).</span>
              </li>
            </ul>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Features
            </h3>
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <FileCode className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">File Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Open individual files, entire folders, or ZIP archives. The editor automatically detects HTML, CSS, and JavaScript files.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Eye className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Live Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    Toggle live preview on/off. When enabled, changes are reflected automatically. When disabled, use CTRL+S to save and update the preview.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <LayoutGrid className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Flexible Layout</h4>
                  <p className="text-sm text-muted-foreground">
                    Change the layout to position the preview at the top, bottom, left, or right of the editors.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <ImageIcon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Image Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Images from opened folders are automatically included and displayed in the preview.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Download className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Download Options</h4>
                  <p className="text-sm text-muted-foreground">
                    Download individual files (HTML, CSS, JS, SVG) or download the entire project as a ZIP archive with all resources properly linked.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Palette className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1">Theme Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Switch between light, dark, and system themes. The editor theme automatically matches your preference.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Save file (when live preview is off)</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-background border rounded">CTRL + S</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Copy code</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-background border rounded">CTRL + C</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Paste code</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-background border rounded">CTRL + V</kbd>
              </div>
            </div>
          </section>

          {/* Supported File Types */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Supported File Types</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">HTML</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">CSS</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">JavaScript</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">SVG</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">Images</span>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>You can have multiple files of the same type open in separate tabs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>At least one HTML file must always remain open.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>When opening folders or ZIP files, all HTML, CSS, and JS files in subdirectories are automatically imported.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>The preview automatically combines all CSS and JavaScript files.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Tailwind CSS and jQuery are automatically available in the preview when editing HTML files.</span>
              </li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}


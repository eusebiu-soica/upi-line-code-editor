"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { FileCode, Folder, FolderArchive, Eye, EyeOff, Keyboard, Download, LayoutGrid, Palette, Code, Image as ImageIcon, Zap, Sparkles, CheckCircle2 } from "lucide-react"

interface InfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InfoModal({ open, onOpenChange }: InfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Upi Line Code Editor</DialogTitle>
              <DialogDescription className="text-base mt-1">
                A powerful code editor with live preview for HTML, CSS, and JavaScript
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tailwind CSS Highlight Section */}
          <section className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Built with Tailwind CSS
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                      CDN Included
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tailwind CSS is automatically available in your preview. Just use Tailwind classes directly in your HTML!
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Tailwind CSS v3</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>jQuery 3.7.1</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-primary/20 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Auto-injected</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-background/60 backdrop-blur-sm border border-primary/10">
                <p className="text-xs font-mono text-muted-foreground">
                  <span className="text-primary">Example:</span> Use classes like <code className="px-1.5 py-0.5 rounded bg-muted text-xs">bg-blue-500</code>, <code className="px-1.5 py-0.5 rounded bg-muted text-xs">text-white</code>, <code className="px-1.5 py-0.5 rounded bg-muted text-xs">p-4</code> directly in your HTML
                </p>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Code className="w-4 h-4 text-primary" />
              </div>
              Getting Started
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Start by opening a file, folder, or ZIP archive using the "Open" menu in the header.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Edit your HTML, CSS, and JavaScript files in the editor tabs. Use Tailwind classes directly in your HTML!
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  View your changes in real-time in the preview panel (when live preview is enabled).
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              Features
            </h3>
            <div className="grid gap-3">
              <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FileCode className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1.5">File Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Open individual files, entire folders, or ZIP archives. The editor automatically detects HTML, CSS, and JavaScript files.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1.5">Live Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    Toggle live preview on/off. When enabled, changes are reflected automatically. When disabled, use CTRL+S to save and update the preview.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1.5">Flexible Layout</h4>
                  <p className="text-sm text-muted-foreground">
                    Change the layout to position the preview at the top, bottom, left, or right of the editors.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1.5">Image Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Images from opened folders are automatically included and displayed in the preview.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1.5">Download Options</h4>
                  <p className="text-sm text-muted-foreground">
                    Download individual files (HTML, CSS, JS, SVG) or download the entire project as a ZIP archive with all resources properly linked, including Tailwind CSS CDN.
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-primary/50 hover:shadow-md transition-all">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1.5">Theme Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Switch between light, dark, and system themes. The editor theme automatically matches your preference.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Keyboard className="w-4 h-4 text-primary" />
              </div>
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <span className="text-sm text-muted-foreground">Save file (when live preview is off)</span>
                <kbd className="px-3 py-1.5 text-xs font-semibold bg-background border rounded-md shadow-sm">CTRL + S</kbd>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <span className="text-sm text-muted-foreground">Copy code</span>
                <kbd className="px-3 py-1.5 text-xs font-semibold bg-background border rounded-md shadow-sm">CTRL + C</kbd>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <span className="text-sm text-muted-foreground">Paste code</span>
                <kbd className="px-3 py-1.5 text-xs font-semibold bg-background border rounded-md shadow-sm">CTRL + V</kbd>
              </div>
            </div>
          </section>

          {/* Supported File Types */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Supported File Types</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">HTML</span>
              <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">CSS</span>
              <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">JavaScript</span>
              <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">SVG</span>
              <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">Images</span>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Pro Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  You can have multiple files of the same type open in separate tabs.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  At least one HTML file must always remain open.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  When opening folders or ZIP files, all HTML, CSS, and JS files in subdirectories are automatically imported.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-primary/5">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  The preview automatically combines all CSS and JavaScript files.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border-l-4 border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Tailwind CSS and jQuery are automatically available</span> in the preview when editing HTML files. No setup required!
                </p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}



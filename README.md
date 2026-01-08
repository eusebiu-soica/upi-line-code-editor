# ⚡ Upi Line Code Editor

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![React](https://img.shields.io/badge/React-19.2.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**A powerful, modern code editor with live preview for HTML, CSS, and JavaScript**

### 🌐 [Live Demo](https://upi-line-code-editor.vercel.app/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

**Upi Line Code Editor** is a full-featured, browser-based code editor built with Next.js and Monaco Editor. It provides a seamless development experience with live preview, file management, and built-in support for Tailwind CSS and jQuery. Perfect for prototyping, learning, or quick web development tasks.

> 🌐 **Try it live:** [https://upi-line-code-editor.vercel.app/](https://upi-line-code-editor.vercel.app/)

### ✨ Key Highlights

- 🚀 **Live Preview** - See your changes in real-time as you code
- 🎨 **Tailwind CSS Ready** - Built-in Tailwind CSS CDN support (no setup required!)
- 📁 **Smart File Management** - Open files, folders, or ZIP archives with recursive search
- 🖼️ **Image Support** - Automatic image handling with base64 encoding
- 💾 **Multiple Download Options** - Export HTML, CSS, JS, SVG, or entire project as ZIP
- 🌓 **Theme Support** - Light, dark, and system theme modes
- 🔍 **Code Comparison** - Built-in diff editor for comparing code snippets
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile

---

## 🚀 Features

### 📝 Code Editing
- **Monaco Editor** - The same editor that powers VS Code
- **Syntax Highlighting** - Support for HTML, CSS, JavaScript, and SVG
- **Multiple Tabs** - Work with multiple files simultaneously
- **Auto-save** - Optional live preview with manual save option
- **Code Comparison** - Side-by-side diff editor for code comparison

### 🎨 Preview & Styling
- **Live Preview** - Real-time preview with debounced updates (500ms)
- **Tailwind CSS Integration** - Automatic Tailwind Play CDN injection
- **jQuery Support** - jQuery 3.7.1 automatically included
- **Image Embedding** - Images converted to base64 data URLs for offline use
- **Combined Assets** - All CSS and JS files automatically combined in preview

### 📂 File Management
- **Open Files** - Individual file selection
- **Open Folders** - Recursive folder scanning for HTML, CSS, JS files
- **ZIP Support** - Extract and import files from ZIP archives
- **Image Detection** - Automatic image discovery and processing
- **Smart Defaults** - First HTML file becomes the default preview

### 💾 Export & Download
- **Individual Files** - Download HTML, CSS, JS, or SVG separately
- **ZIP Archive** - Download entire project with proper file linking
- **Standalone HTML** - Downloaded HTML includes Tailwind CSS, jQuery, and all assets
- **Project Naming** - Custom project names for organized downloads

### 🎛️ Layout & Customization
- **Flexible Layouts** - 4 layout options (preview top/bottom/left/right)
- **Resizable Panels** - Drag to resize editor and preview sections
- **Theme Toggle** - Switch between light, dark, and system themes
- **Responsive Design** - Optimized for all screen sizes

### ⌨️ Keyboard Shortcuts
- `Ctrl + S` - Save file (when live preview is disabled)
- `Ctrl + C` - Copy code
- `Ctrl + V` - Paste code

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/eusebiu-soica/upi-line-code-editor.git
   cd upi-line-code-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

---

## 💻 Usage

### Getting Started

1. **Open Files**
   - Click the "Open" button in the header
   - Choose to open a file, folder, or ZIP archive
   - Files are automatically organized by type (HTML, CSS, JS)

2. **Edit Your Code**
   - Click on any tab to edit that file
   - Make changes in the Monaco editor
   - See live updates in the preview panel (if live preview is enabled)

3. **Use Tailwind CSS**
   - Simply use Tailwind classes in your HTML
   - No configuration needed - Tailwind is automatically available!
   - Example: `<div class="bg-blue-500 text-white p-4">Hello</div>`

4. **Download Your Project**
   - Click the "Download" button
   - Choose to download individual files or the entire project as ZIP
   - All files will be properly linked and ready to use

### Advanced Features

#### Code Comparison
- Click "Compare the Code" in the header
- Paste code into left and right editors
- See side-by-side differences with syntax highlighting

#### Layout Customization
- Click "Change Layout" to switch between 4 layout options:
  - Editors bottom / Preview top
  - Editors top / Preview bottom
  - Editors left / Preview right
  - Editors right / Preview left

#### Live Preview Toggle
- Toggle live preview on/off with the eye icon
- When off, use `Ctrl + S` to manually update the preview
- Green badge = Live preview ON
- Red badge = Live preview OFF

---

## 🛠️ Tech Stack

### Core Technologies
- **[Next.js 16.1.1](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.3](https://react.dev/)** - UI library
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type safety
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Styling

### Key Libraries
- **@monaco-editor/react** - React wrapper for Monaco Editor
- **next-themes** - Theme management (light/dark mode)
- **jszip** - ZIP file creation and extraction
- **react-resizable-panels** - Resizable layout panels
- **sonner** - Toast notifications
- **lucide-react** - Icon library
- **radix-ui** - Accessible UI components

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## 📁 Project Structure

```
upi-line-code-editor/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── CompareCodeModal.tsx
│   ├── DownloadButton.tsx
│   ├── EditorTabs.tsx
│   ├── Header.tsx
│   ├── InfoModal.tsx
│   ├── MainLayout.tsx
│   ├── MonacoEditor.tsx
│   ├── Preview.tsx
│   └── ui/                # UI components (shadcn)
├── contexts/              # React contexts
│   └── FileContext.tsx    # Global file state management
├── hooks/                 # Custom React hooks
│   └── use-nobile.tsx     # Mobile detection hook
├── lib/                   # Utility functions
│   ├── download-utils.ts  # Download functionality
│   ├── file-utils.ts      # File operations
│   └── utils.ts           # General utilities
├── public/                # Static assets
│   ├── icons/             # PWA icons
│   ├── logo.png
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
└── package.json
```

---

## 🎨 Supported File Types

- **HTML** - `.html`, `.htm`
- **CSS** - `.css`
- **JavaScript** - `.js`
- **SVG** - `.svg` (treated as HTML)
- **Images** - `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`

---

## 🔧 Configuration

### Environment Variables

No environment variables required for basic usage.

### PWA Configuration

The app is configured as a Progressive Web App (PWA) with:
- Service worker for offline support
- App manifest for installation
- Multiple icon sizes for different devices

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add TypeScript types for all new code
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - The amazing code editor
- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - The utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Lucide](https://lucide.dev/) - Icon library

---

## 📧 Contact

For questions, suggestions, or support, please open an issue on GitHub.

---

<div align="center">

**Made with ❤️ using Next.js and Monaco Editor**

⭐ Star this repo if you find it helpful!

</div>

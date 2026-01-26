import { MainLayout } from "@/components/MainLayout";
import { DragDropZone } from "@/components/DragDropZone";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Code Editor - HTML, CSS, JavaScript with Live Preview",
  description: "Edit HTML, CSS, and JavaScript code online with live preview. Free code editor powered by Monaco Editor with Tailwind CSS and jQuery support. Perfect for web development and prototyping.",
  keywords: "online code editor, HTML editor, CSS editor, JavaScript editor, live preview, web development, code playground, Monaco editor, Tailwind CSS, jQuery, free code editor",
  openGraph: {
    title: "Upi Line Code Editor - Free Online HTML, CSS, JavaScript Editor",
    description: "Edit HTML, CSS, and JavaScript code online with live preview. Free code editor powered by Monaco Editor.",
    type: "website",
  },
};

export default function Page() {
    return (
        <main id="main-content" tabIndex={-1} role="main">
            <DragDropZone>
                <MainLayout />
            </DragDropZone>
        </main>
    );
}
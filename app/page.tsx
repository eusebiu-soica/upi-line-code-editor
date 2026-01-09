import { MainLayout } from "@/components/MainLayout";
import { DragDropZone } from "@/components/DragDropZone";

export default function Page() {
    return (
        <main id="main-content" tabIndex={-1}>
            <DragDropZone>
                <MainLayout />
            </DragDropZone>
        </main>
    );
}
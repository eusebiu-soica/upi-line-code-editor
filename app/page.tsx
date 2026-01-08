import { MainLayout } from "@/components/MainLayout";
import { DragDropZone } from "@/components/DragDropZone";

export default function Page() {
    return (
        <DragDropZone>
            <MainLayout />
        </DragDropZone>
    );
}
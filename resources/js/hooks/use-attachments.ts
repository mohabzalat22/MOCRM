import { useState, useRef } from 'react';
import type { Attachment } from '@/types';

export function useAttachments(initialAttachments: Attachment[] = []) {
    const [files, setFiles] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] =
        useState<Attachment[]>(initialAttachments);
    const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>(
        [],
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeNewFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (id: number) => {
        setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
        setRemovedAttachmentIds((prev) => [...prev, id]);
    };

    const resetAttachments = (initial: Attachment[] = []) => {
        setFiles([]);
        setExistingAttachments(initial);
        setRemovedAttachmentIds([]);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return {
        files,
        existingAttachments,
        removedAttachmentIds,
        fileInputRef,
        handleFileChange,
        removeNewFile,
        removeExistingAttachment,
        resetAttachments,
        triggerFileInput,
    };
}

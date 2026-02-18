import { Plus, X, File as FileIcon, Paperclip } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Attachment } from '@/types';

interface AttachmentsSectionProps {
    existingAttachments: Attachment[];
    newFiles: File[];
    onAddFiles: () => void;
    removeExistingAttachment: (id: number) => void;
    removeNewFile: (index: number) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
    existingAttachments,
    newFiles,
    onAddFiles,
    removeExistingAttachment,
    removeNewFile,
    fileInputRef,
    onFileChange,
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Attachments</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-[10px]"
                    onClick={onAddFiles}
                >
                    <Plus className="h-3 w-3" />
                    Attach Files
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={onFileChange}
                />
            </div>

            <div className="min-h-[80px] space-y-2 rounded-lg border border-dashed bg-muted/10 p-2">
                {/* Existing Attachments */}
                {existingAttachments.map((file) => (
                    <div
                        key={file.id}
                        className="group flex items-center justify-between gap-2 rounded border bg-background px-2 py-1.5"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate text-xs font-medium">
                                {file.file_name}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="opacity-0 transition-all group-hover:opacity-100 hover:text-destructive"
                            onClick={() => removeExistingAttachment(file.id)}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}

                {/* New Files */}
                {newFiles.map((file, idx) => (
                    <div
                        key={idx}
                        className="group flex items-center justify-between gap-2 rounded border border-primary/20 bg-primary/5 px-2 py-1.5"
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Paperclip className="h-3.5 w-3.5 shrink-0 animate-pulse text-primary" />
                            <span className="truncate text-xs font-medium">
                                {file.name}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="hover:text-destructive"
                            onClick={() => removeNewFile(idx)}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}

                {existingAttachments.length === 0 && newFiles.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center py-4 text-muted-foreground">
                        <Paperclip className="mb-1 h-5 w-5 opacity-20" />
                        <span className="text-[10px]">No files attached</span>
                    </div>
                )}
            </div>
        </div>
    );
};

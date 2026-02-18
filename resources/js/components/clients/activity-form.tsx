import { Calendar, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { useActivityForm } from '@/hooks/use-activity-form';
import { useAttachments } from '@/hooks/use-attachments';
import type { Activity, ActivityType } from '@/types';
import { ActionItemsSection } from './ActionItemsSection';
import ActivityTagInput, { type ActivityTag } from './activity-tag-input';

import { ActivityTypeSelector } from './ActivityTypeSelector';
import { AttachmentsSection } from './AttachmentsSection';
import { ReminderSection } from './ReminderSection';
import { TypeSpecificFields } from './TypeSpecificFields';

export interface AddActivityFormProps {
    clientId?: number | string;
    activity?: Activity;
    initialType?: ActivityType;
    onSuccess?: () => void;
    enableImmediateSave?: boolean;
}

export default function ActivityForm({
    activity,
    initialType,
    onSuccess,
    enableImmediateSave = false,
    clientId,
}: AddActivityFormProps) {
    const {
        data,
        setData,
        quickMode,
        setQuickMode,
        occurredAt,
        setOccurredAt,
        markdownNotes,
        setMarkdownNotes,
        actionItems,
        newActionItem,
        setNewActionItem,
        processing,
        reminderEnabled,
        setReminderEnabled,
        reminderData,
        setReminderData,
        handleTypeChange,
        updateData,
        addActionItem,
        toggleActionItem,
        removeActionItem,
        resetForm,
        submit,
    } = useActivityForm({
        activity,
        initialType,
        clientId,
        onSuccess,
        enableImmediateSave,
    });

    const {
        files,
        existingAttachments,
        removedAttachmentIds,
        fileInputRef,
        handleFileChange,
        removeNewFile,
        removeExistingAttachment,
        resetAttachments,
        triggerFileInput,
    } = useAttachments(activity?.attachments || []);

    const [selectedTags, setSelectedTags] = useState<ActivityTag[]>(
        activity?.tags?.map((t) => ({
            name: t.name,
            color: t.color,
            id: t.id,
        })) || [],
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        submit(e, {
            selectedTags,
            files,
            removedAttachmentIds,
            resetAttachments: () => {
                resetForm();
                resetAttachments();
                setSelectedTags([]);
            },
        });
    };

    return (
        <Card className="overflow-hidden border-none bg-background shadow-none">
            <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <ActivityTypeSelector
                        currentType={data.type}
                        onTypeChange={handleTypeChange}
                        quickMode={quickMode}
                        onQuickModeToggle={() => setQuickMode(!quickMode)}
                    />

                    <div className="grid gap-6 p-4">
                        {/* Summary & Date */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="summary"
                                    className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                >
                                    Subject / Title
                                </Label>
                                <Input
                                    id="summary"
                                    className="h-10 focus-visible:ring-1"
                                    placeholder={
                                        data.type === 'note'
                                            ? 'Quick summary...'
                                            : data.type === 'call'
                                              ? 'Call topic...'
                                              : 'Activity reference...'
                                    }
                                    value={data.summary}
                                    onChange={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            summary: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            {!quickMode && (
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="occurred_at"
                                        className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                                    >
                                        Activity Time
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="occurred_at"
                                            type="datetime-local"
                                            className="h-10 pl-9"
                                            value={occurredAt}
                                            onChange={(e) =>
                                                setOccurredAt(e.target.value)
                                            }
                                            required
                                        />
                                        <Calendar className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Type-Specific Fields */}
                        {!quickMode && (
                            <div className="animate-in duration-300 fade-in">
                                <TypeSpecificFields
                                    type={data.type}
                                    data={data.data}
                                    updateData={updateData}
                                />
                            </div>
                        )}

                        {/* Action Items */}
                        {!quickMode && data.type === 'meeting' && (
                            <ActionItemsSection
                                actionItems={actionItems}
                                newActionItem={newActionItem}
                                setNewActionItem={setNewActionItem}
                                addActionItem={addActionItem}
                                toggleActionItem={toggleActionItem}
                                removeActionItem={removeActionItem}
                            />
                        )}

                        {/* Notes Section */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="notes"
                                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                            >
                                {data.type === 'note'
                                    ? 'Note Content'
                                    : 'Detailed Notes'}
                            </Label>
                            <MarkdownEditor
                                value={markdownNotes}
                                onChange={setMarkdownNotes}
                                placeholder="Write your notes here... Markdown is supported."
                                className="rounded-lg border bg-background shadow-sm focus-within:ring-1 focus-within:ring-primary"
                                minHeight={quickMode ? '100px' : '180px'}
                            />
                        </div>

                        {/* Tags & Attachments */}
                        {!quickMode && (
                            <div className="grid grid-cols-1 gap-6 border-t pt-2 sm:grid-cols-2">
                                <div className="space-y-4">
                                    <ActivityTagInput
                                        tags={selectedTags}
                                        onChange={setSelectedTags}
                                    />
                                </div>

                                <AttachmentsSection
                                    existingAttachments={existingAttachments}
                                    newFiles={files}
                                    onAddFiles={triggerFileInput}
                                    removeExistingAttachment={
                                        removeExistingAttachment
                                    }
                                    removeNewFile={removeNewFile}
                                    fileInputRef={fileInputRef}
                                    onFileChange={handleFileChange}
                                />
                            </div>
                        )}

                        {/* Reminders */}
                        {!quickMode && (
                            <ReminderSection
                                enabled={reminderEnabled}
                                setEnabled={setReminderEnabled}
                                reminderData={reminderData}
                                onDataChange={setReminderData}
                            />
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 border-t bg-muted/10 p-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="group h-10 min-w-[140px] px-6 font-semibold shadow-md"
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Saving...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {activity
                                        ? 'Update Activity'
                                        : 'Post Activity'}
                                    <Zap className="h-3.5 w-3.5 transition-transform group-hover:scale-125" />
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

import { useForm } from '@inertiajs/react';
import { Loader2, Paperclip, Send, Trash2 } from 'lucide-react';
import React, { useRef } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Project } from '@/types';

interface ProjectUpdatesProps {
    project: Project;
}

export function ProjectUpdates({ project }: ProjectUpdatesProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, reset } = useForm({
        content: '',
        files: [] as File[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.content.trim() && data.files.length === 0) return;

        post(route('projects.updates.store', project.id), {
            onSuccess: () => {
                reset();
                toast.success('Update added to timeline');
            },
            onError: () => {
                toast.error('Failed to add update');
            },
            preserveScroll: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setData('files', [...data.files, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index: number) => {
        setData(
            'files',
            data.files.filter((_, i) => i !== index),
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Project Update</CardTitle>
                <CardDescription>
                    Post a progress update or note to the timeline.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        placeholder="What's happening? (This will appear in the project and client activity timelines)"
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        className="min-h-[100px]"
                    />

                    {data.files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {data.files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs"
                                >
                                    <Paperclip className="h-3 w-3" />
                                    <span className="max-w-[150px] truncate">
                                        {file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={processing}
                        >
                            <Paperclip className="mr-2 h-4 w-4" />
                            Attach Files
                        </Button>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                (!data.content.trim() &&
                                    data.files.length === 0)
                            }
                        >
                            {processing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Post Update
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

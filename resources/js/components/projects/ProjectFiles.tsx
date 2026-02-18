import { FileIcon, Download, Clock, User } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Project } from '@/types';

interface ProjectFilesProps {
    project: Project;
}

export function ProjectFiles({ project }: ProjectFilesProps) {
    // Collect all attachments from all activities
    const allAttachments =
        project.activities?.flatMap((activity) =>
            (activity.attachments || []).map((attachment) => ({
                ...attachment,
                uploaded_by: activity.user?.name,
                update_date: activity.created_at,
            })),
        ) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Project Files</CardTitle>
            </CardHeader>
            <CardContent>
                {allAttachments.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
                        No files attached to this project yet.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {allAttachments.map((file, index) => (
                            <div
                                key={index}
                                className="flex flex-col rounded-lg border bg-card p-4 transition-all hover:shadow-md"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                                        <FileIcon className="h-6 w-6" />
                                    </div>
                                    <a
                                        href={route(
                                            'attachments.download',
                                            file.id,
                                        )}
                                        className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                                        title="Download"
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                </div>
                                <div className="mb-4 flex-1">
                                    <h4
                                        className="truncate text-sm font-semibold"
                                        title={file.file_name}
                                    >
                                        {file.file_name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.file_size / 1024 / 1024).toFixed(
                                            2,
                                        )}{' '}
                                        MB
                                    </p>
                                </div>
                                <div className="mt-auto space-y-1 border-t pt-4">
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        <span>
                                            Uploaded by: {file.uploaded_by}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {file.update_date
                                                ? new Date(
                                                      file.update_date,
                                                  ).toLocaleDateString()
                                                : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

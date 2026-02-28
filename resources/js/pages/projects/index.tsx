import { Head, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { getColumns } from '@/components/projects/Columns';
import { DataTable } from '@/components/projects/DataTable';
import { ProjectForm } from '@/components/projects/project-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project, Tag } from '@/types';

interface ProjectsPageProps {
    projects: Project[];
    clients: { id: number; name: string }[];
    allTags: Tag[];
    statuses: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: '/projects',
    },
];

export default function ProjectsIndex({
    projects,
    clients,
    allTags = [],
    statuses = [],
}: ProjectsPageProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [deletingProject, setDeletingProject] = useState<Project | null>(
        null,
    );

    const handleDelete = () => {
        if (!deletingProject) return;
        router.delete(`/projects/${deletingProject.id}`, {
            onSuccess: () => setDeletingProject(null),
        });
    };

    const columns = useMemo(
        () =>
            getColumns({
                onEdit: (project) => setEditingProject(project),
                onDelete: (project) => setDeletingProject(project),
            }),
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Projects
                        </h1>
                        <p className="text-muted-foreground">
                            Track ongoing work and deliverables.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Project
                    </Button>
                </div>

                <div className="mt-0">
                    <DataTable
                        columns={columns}
                        data={projects}
                        allTags={allTags}
                        clients={clients}
                        statuses={statuses}
                    />
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Project</DialogTitle>
                        <DialogDescription>
                            Create a new project linked to a client.
                        </DialogDescription>
                    </DialogHeader>
                    <ProjectForm
                        clients={clients}
                        allTags={allTags}
                        onSuccess={() => setIsCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={!!editingProject}
                onOpenChange={(open) => !open && setEditingProject(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Make changes to your project details.
                        </DialogDescription>
                    </DialogHeader>
                    {editingProject && (
                        <ProjectForm
                            project={editingProject}
                            clients={clients}
                            allTags={allTags}
                            onSuccess={() => setEditingProject(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingProject}
                title="Delete Project?"
                message={`Are you sure you want to delete "${deletingProject?.name}"? This will permanently remove all associated tasks and data.`}
                onConfirm={handleDelete}
                onCancel={() => setDeletingProject(null)}
            />
        </AppLayout>
    );
}

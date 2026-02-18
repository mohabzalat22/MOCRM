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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project } from '@/types';

interface ProjectsPageProps {
    projects: Project[];
    clients: { id: number; name: string }[];
    filters?: { status: string };
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
    filters = { status: 'active' },
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

    const handleTabChange = (value: string) => {
        router.get(
            '/projects',
            { status: value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

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

                <Tabs
                    defaultValue={filters.status}
                    onValueChange={handleTabChange}
                    className="w-full"
                >
                    <TabsList className="mb-4">
                        <TabsTrigger value="active">
                            Active Projects
                        </TabsTrigger>
                        <TabsTrigger value="archived">Archived</TabsTrigger>
                        <TabsTrigger value="all">All Projects</TabsTrigger>
                    </TabsList>
                    <TabsContent value={filters.status} className="mt-0">
                        <DataTable columns={columns} data={projects} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Project</DialogTitle>
                        <DialogDescription>
                            Create a new project linked to a client.
                        </DialogDescription>
                    </DialogHeader>
                    <ProjectForm
                        clients={clients}
                        onSuccess={() => setIsCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={!!editingProject}
                onOpenChange={(open) => !open && setEditingProject(null)}
            >
                <DialogContent className="sm:max-w-[500px]">
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
                            onSuccess={() => setEditingProject(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingProject}
                title="Delete Project?"
                message="Are you sure you want to delete this project? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setDeletingProject(null)}
            />
        </AppLayout>
    );
}

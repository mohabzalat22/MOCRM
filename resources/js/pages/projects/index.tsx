import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getColumns } from '@/components/projects/Columns';
import { DataTable } from '@/components/projects/DataTable';
import type { TableFilters } from '@/components/projects/DataTable';
import { ProjectForm } from '@/components/projects/project-form';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Project, Tag, PaginatedResponse } from '@/types';

interface ProjectsPageProps {
    projects: PaginatedResponse<Project>;
    clients: { id: number; name: string }[];
    allTags: Tag[];
    statuses: string[];
    filters: TableFilters;
    templates: { id: number; name: string }[];
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
    filters,
    templates = [],
}: ProjectsPageProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const columns = useMemo(() => getColumns(), []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />

            <div className="mx-auto w-full max-w-[1800px] space-y-6">
                <ProjectHeader
                    title="Projects"
                    description="Track ongoing work and deliverables."
                >
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Project
                    </Button>
                </ProjectHeader>

                <div className="mt-0 px-6 pb-6">
                    <DataTable
                        columns={columns}
                        data={projects.data}
                        pagination={projects}
                        filters={filters}
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
                        templates={templates}
                        onSuccess={() => setIsCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    Plus,
    Layout,
    MoreHorizontal,
    Edit2,
    Trash2,
    ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { ProjectTemplate, BreadcrumbItem } from '@/types';

interface ProjectTemplatesIndexProps {
    templates: ProjectTemplate[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: '/projects',
    },
    {
        title: 'Templates',
        href: '/project-templates',
    },
];

export default function ProjectTemplatesIndex({
    templates,
}: ProjectTemplatesIndexProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] =
        useState<ProjectTemplate | null>(null);

    const {
        data,
        setData,
        post,
        patch,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        name: '',
        description: '',
    });

    const onCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('project-templates.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const onEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTemplate) return;
        patch(route('project-templates.update', editingTemplate.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingTemplate(null);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this template?')) {
            destroy(route('project-templates.destroy', id));
        }
    };

    const openEdit = (template: ProjectTemplate) => {
        setEditingTemplate(template);
        setData({
            name: template.name,
            description: template.description || '',
        });
        setIsEditOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Project Templates" />

            <div className="mx-auto w-full max-w-[1800px] space-y-6">
                <ProjectHeader
                    title="Project Templates"
                    description="Manage reusable project structures and task lists."
                >
                    <Button
                        onClick={() => {
                            reset();
                            setIsCreateOpen(true);
                        }}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" /> Create Template
                    </Button>
                </ProjectHeader>

                <div className="px-6 pb-6">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="group relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                        <Layout className="h-6 w-6" />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    openEdit(template)
                                                }
                                            >
                                                <Edit2 className="mr-2 h-4 w-4" />{' '}
                                                Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() =>
                                                    handleDelete(template.id)
                                                }
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />{' '}
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="mt-4 flex-1">
                                    <h3 className="text-lg font-semibold">
                                        {template.name}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {template.description ||
                                            'No description provided.'}
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {template.tasks_count} tasks
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="gap-1 px-2"
                                    >
                                        <Link
                                            href={route(
                                                'project-templates.show',
                                                template.id,
                                            )}
                                        >
                                            Manage Tasks{' '}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {templates.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                                <Layout className="h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    No templates yet
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create your first template to speed up your
                                    project setup.
                                </p>
                                <Button
                                    onClick={() => setIsCreateOpen(true)}
                                    variant="outline"
                                    className="mt-4"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Create
                                    Template
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Project Template</DialogTitle>
                        <DialogDescription>
                            Define a new template for future projects.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onCreateSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g. New Client Onboarding"
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="What is this template for?"
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Create Template
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Template Details</DialogTitle>
                        <DialogDescription>
                            Update the name and description of this template.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onEditSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Template Name</Label>
                            <Input
                                id="edit-name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">
                                Description
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive">
                                    {errors.description}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditingTemplate(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

import { Head, router, useForm } from '@inertiajs/react';
import {
    Plus,
    Layout,
    FileText,
    ListTodo,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { TemplateTaskForm } from '@/components/project-templates/TemplateTaskForm';
import { TemplateTaskList } from '@/components/project-templates/TemplateTaskList';
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
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type {
    ProjectTemplate,
    BreadcrumbItem,
    ProjectTemplateTask,
} from '@/types';

interface ProjectTemplateShowProps {
    template: ProjectTemplate;
}

export default function ProjectTemplateShow({
    template,
}: ProjectTemplateShowProps) {
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('tasks');
    const [editingTask, setEditingTask] = useState<ProjectTemplateTask | null>(
        null,
    );
    const [initialParentId, setInitialParentId] = useState<number | null>(null);

    const { data, setData, patch, processing, errors } = useForm({
        name: template.name,
        description: template.description || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Projects',
            href: '/projects',
        },
        {
            title: 'Templates',
            href: '/project-templates',
        },
        {
            title: template.name,
            href: `/project-templates/${template.id}`,
        },
    ];

    const openEditTask = (task: ProjectTemplateTask) => {
        setEditingTask(task);
        setIsAddTaskOpen(true);
    };

    const handleCloseTaskForm = () => {
        setIsAddTaskOpen(false);
        setEditingTask(null);
        setInitialParentId(null);
    };

    const handleAddSubtask = (parentId: number) => {
        setInitialParentId(parentId);
        setIsAddTaskOpen(true);
    };

    const handleEditTemplate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('project-templates.update', template.id), {
            onSuccess: () => setIsEditTemplateOpen(false),
        });
    };

    const handleDeleteTemplate = () => {
        if (confirm('Are you sure you want to delete this template?')) {
            router.delete(route('project-templates.destroy', template.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${template.name} - Template`} />

            <div className="flex h-full flex-col">
                {/* Header Section */}
                <div className="border-b bg-background/95 px-6 py-5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Layout className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-3xl sm:leading-none">
                                    {template.name}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setIsEditTemplateOpen(true)
                                        }
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleDeleteTemplate}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                onClick={() => setIsAddTaskOpen(true)}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" /> Add Task
                            </Button>
                        </div>
                    </div>

                    {/* Metadata Bar */}
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4" />
                            <span>
                                {template.tasks_count ||
                                    template.tasks?.length ||
                                    0}{' '}
                                Tasks
                            </span>
                        </div>
                        {template.description && (
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="max-w-[500px] truncate">
                                    {template.description}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 bg-muted/10 p-6">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-4"
                    >
                        <TabsList className="h-11 justify-start rounded-lg bg-background p-1 text-muted-foreground shadow-sm">
                            <TabsTrigger
                                value="tasks"
                                className="gap-2 rounded-md px-4 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
                            >
                                <ListTodo className="h-4 w-4" />
                                Tasks
                            </TabsTrigger>
                        </TabsList>

                        <div className="min-h-[600px]">
                            <TabsContent
                                value="tasks"
                                className="m-0 h-full border-none p-0"
                            >
                                <div className="p-1">
                                    <TemplateTaskList
                                        templateId={template.id}
                                        tasks={template.tasks || []}
                                        onEdit={openEditTask}
                                        onAddSubtask={handleAddSubtask}
                                    />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>

            {/* Edit Template Dialog */}
            <Dialog
                open={isEditTemplateOpen}
                onOpenChange={setIsEditTemplateOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Template Details</DialogTitle>
                        <DialogDescription>
                            Update the name and description of this template.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={handleEditTemplate}
                        className="space-y-4 pt-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input
                                id="name"
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
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                rows={3}
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
                                onClick={() => setIsEditTemplateOpen(false)}
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

            {/* Add/Edit Task Dialog */}
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingTask
                                ? 'Edit Template Task'
                                : 'Add Task to Template'}
                        </DialogTitle>
                        <DialogDescription>
                            Define the details for this template task.
                        </DialogDescription>
                    </DialogHeader>
                    <TemplateTaskForm
                        templateId={template.id}
                        task={editingTask}
                        templateTasks={template.tasks || []}
                        onSuccess={handleCloseTaskForm}
                        onCancel={handleCloseTaskForm}
                        initialParentId={initialParentId}
                    />
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

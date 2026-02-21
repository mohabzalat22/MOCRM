import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    Calendar as CalendarIcon,
    FileText,
    User,
    FolderArchive,
    RotateCcw,
    LayoutList,
    KanbanSquare,
    CalendarDays,
    GanttChartSquare,
    Activity,
    Files,
    MoreHorizontal,
    Clock,
} from 'lucide-react';
import { useState } from 'react';
import ActivityTimeline from '@/components/clients/activity-timeline';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { AddTaskForm } from '@/components/projects/AddTaskForm';
import { ProjectFiles } from '@/components/projects/ProjectFiles';
import { ProjectTimeline } from '@/components/projects/ProjectTimeline';
import { ProjectUpdates } from '@/components/projects/ProjectUpdates';
import { TaskEditModal } from '@/components/projects/TaskEditModal';
import { TaskList } from '@/components/projects/TaskList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { projectService } from '@/services/projectService';
import type { BreadcrumbItem, Project } from '@/types';
import type { Task } from '@/types/project';
import { BoardView } from './views/BoardView';
import { CalendarView } from './views/CalendarView';

interface ProjectShowProps {
    project: Project;
}

const statusMap = {
    not_started: { label: 'Not Started', variant: 'outline' as const },
    in_progress: { label: 'In Progress', variant: 'outline' as const },
    on_hold: { label: 'On Hold', variant: 'outline' as const },
    completed: { label: 'Completed', variant: 'outline' as const },
    cancelled: { label: 'Cancelled', variant: 'outline' as const },
    archived: { label: 'Archived', variant: 'outline' as const },
};

export default function ProjectShow({ project }: ProjectShowProps) {
    const [activeTab, setActiveTab] = useState<string>('list');
    const [confirmArchive, setConfirmArchive] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: project.name, href: `/projects/${project.id}` },
    ];

    const status =
        statusMap[project.status as keyof typeof statusMap] ||
        statusMap.not_started;

    const isArchived = ['completed', 'cancelled', 'archived'].includes(
        project.status,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${project.name} - Project`} />

            <TooltipProvider>
                <div className="flex h-full flex-col">
                    {/* Header Section */}
                    <div className="border-b bg-background/95 px-6 py-5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-3xl sm:leading-none">
                                    {project.name}
                                </h1>
                                <Badge
                                    variant={status.variant}
                                    className="px-2 text-[10px] font-bold tracking-wider uppercase"
                                >
                                    {status.label}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                                {isArchived ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            projectService.restoreProject(
                                                project.id,
                                                { preserveScroll: true },
                                            )
                                        }
                                        className="gap-2"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Restore
                                    </Button>
                                ) : (
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
                                                    setConfirmArchive(true)
                                                }
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <FolderArchive className="mr-2 h-4 w-4" />
                                                Archive Project
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>

                        {/* Metadata Bar */}
                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>Client:</span>
                                <Link
                                    href={`/clients/${project.client_id}`}
                                    className="font-medium text-foreground hover:underline"
                                >
                                    {project.client?.name}
                                </Link>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span>
                                    {project.start_date
                                        ? format(
                                              new Date(project.start_date),
                                              'MMM d, yyyy',
                                          )
                                        : 'No start date'}
                                </span>
                                {project.end_date && (
                                    <>
                                        <span>→</span>
                                        <span>
                                            {format(
                                                new Date(project.end_date),
                                                'MMM d, yyyy',
                                            )}
                                        </span>
                                    </>
                                )}
                            </div>
                            {project.description && (
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="max-w-[300px] truncate">
                                        {project.description}
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
                            <TabsList className="h-11 w-full justify-start rounded-lg bg-background p-1 text-muted-foreground shadow-sm sm:w-auto">
                                <TabsTrigger
                                    value="list"
                                    className="gap-2 rounded-md px-4 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
                                >
                                    <LayoutList className="h-4 w-4" />
                                    List
                                </TabsTrigger>
                                <TabsTrigger
                                    value="board"
                                    className="gap-2 rounded-md px-4 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
                                >
                                    <KanbanSquare className="h-4 w-4" />
                                    Board
                                </TabsTrigger>
                                <TabsTrigger
                                    value="timeline"
                                    className="gap-2 rounded-md px-4 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
                                >
                                    <GanttChartSquare className="h-4 w-4" />
                                    Timeline
                                </TabsTrigger>
                                <TabsTrigger
                                    value="calendar"
                                    className="gap-2 rounded-md px-4 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
                                >
                                    <CalendarDays className="h-4 w-4" />
                                    Calendar
                                </TabsTrigger>
                                <TabsTrigger
                                    value="activity"
                                    className="gap-2 rounded-md px-4 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
                                >
                                    <Activity className="h-4 w-4" />
                                    Activity
                                </TabsTrigger>
                                <TabsTrigger
                                    value="files"
                                    className="gap-2 rounded-md px-4 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
                                >
                                    <Files className="h-4 w-4" />
                                    Files
                                </TabsTrigger>
                            </TabsList>

                            <div className="min-h-[600px] rounded-xl border bg-background shadow-sm">
                                <TabsContent
                                    value="list"
                                    className="m-0 h-full border-none p-0"
                                >
                                    <div className="p-1">
                                        <TaskList
                                            projectId={project.id}
                                            tasks={project.tasks || []}
                                            onEditTask={handleEditTask}
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="board"
                                    className="m-0 h-full border-none p-0"
                                >
                                    <div className="h-full p-6">
                                        <BoardView
                                            tasks={project.tasks || []}
                                            onEditTask={handleEditTask}
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="timeline"
                                    className="m-0 h-full border-none p-0"
                                >
                                    <div className="h-full p-4">
                                        <ProjectTimeline
                                            tasks={project.tasks || []}
                                            projectStartDate={
                                                project.start_date ||
                                                new Date().toISOString()
                                            }
                                            projectEndDate={
                                                project.end_date || undefined
                                            }
                                            onEditTask={handleEditTask}
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="calendar"
                                    className="m-0 h-full border-none p-0"
                                >
                                    <div className="h-full p-6">
                                        <CalendarView
                                            tasks={project.tasks || []}
                                            onEditTask={handleEditTask}
                                            onCreateTask={() =>
                                                setIsCreateModalOpen(true)
                                            }
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="activity"
                                    className="m-0 h-full border-none p-0"
                                >
                                    <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2">
                                        <div className="space-y-6">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                                                <Clock className="h-5 w-5 text-muted-foreground" />
                                                Recent Updates
                                            </h3>
                                            <ProjectUpdates project={project} />
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                                                <Activity className="h-5 w-5 text-muted-foreground" />
                                                Activity Log
                                            </h3>
                                            <ActivityTimeline
                                                activities={
                                                    project.activities || []
                                                }
                                                client={project.client!}
                                                hideFilters={true}
                                                hideExport={true}
                                                allowedTypes={new Set(['note'])}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="files"
                                    className="m-0 h-full border-none p-0"
                                >
                                    <div className="h-full p-6">
                                        <ProjectFiles project={project} />
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>

                <ConfirmDialog
                    isOpen={confirmArchive}
                    title="Archive Project?"
                    message="Values this project as completed? It will be moved to the active archive."
                    onConfirm={() => {
                        projectService.archiveProject(project.id, {
                            preserveScroll: true,
                        });
                        setConfirmArchive(false);
                    }}
                    onCancel={() => setConfirmArchive(false)}
                />

                {editingTask && (
                    <TaskEditModal
                        task={editingTask}
                        projectTasks={project.tasks || []}
                        open={!!editingTask}
                        onOpenChange={(open) => {
                            if (!open) setEditingTask(null);
                        }}
                    />
                )}
            </TooltipProvider>

            <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            >
                <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[500px]">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <div className="p-2">
                        <AddTaskForm
                            projectId={project.id}
                            projectTasks={project.tasks || []}
                            onSuccess={() => setIsCreateModalOpen(false)}
                            initialAdding={true}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

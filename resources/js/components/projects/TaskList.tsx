import type { DragEndEvent } from '@dnd-kit/core';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ListTodo, Diamond } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';
import { AddTaskForm } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import { STATUS_COLORS } from './timeline/constants';

interface TaskListProps {
    projectId: number;
    tasks: Task[];
    onEditTask: (task: Task) => void;
}

const EMPTY_TASKS: Task[] = [];

export function TaskList({
    projectId,
    tasks = EMPTY_TASKS,
    onEditTask,
}: TaskListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const toggleExpand = (id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Organize tasks into a hierarchical list for display
    const visibleTasks = useMemo(() => {
        const roots = tasks.filter((t) => !t.parent_id);
        const subTasksByParent = tasks.reduce(
            (acc, t) => {
                if (t.parent_id) {
                    if (!acc[t.parent_id]) acc[t.parent_id] = [];
                    acc[t.parent_id].push(t);
                }
                return acc;
            },
            {} as Record<number, Task[]>,
        );

        const result: (Task & { depth: number; hasChildren: boolean })[] = [];

        const addTasks = (taskList: Task[], depth: number) => {
            taskList.sort((a, b) => a.order - b.order);
            taskList.forEach((task) => {
                const children = subTasksByParent[task.id] || [];
                result.push({
                    ...task,
                    depth,
                    hasChildren: children.length > 0,
                });
                if (expandedIds.has(task.id) && children.length > 0) {
                    addTasks(children, depth + 1);
                }
            });
        };

        addTasks(roots, 0);
        return result;
    }, [tasks, expandedIds]);

    const taskIds = useMemo(
        () => visibleTasks.map((t) => t.id),
        [visibleTasks],
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tasks.findIndex((t) => t.id === active.id);
            const newIndex = tasks.findIndex((t) => t.id === over.id);

            const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);

            taskService.reorderTasks(
                reorderedTasks.map((t, index) => ({
                    id: t.id,
                    order: index,
                })),
            );
        }
    };

    return (
        <Card className="flex h-[700px] flex-col border-border/60 shadow-sm">
            <div className="flex items-center justify-between border-b bg-muted/30 p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                        <ListTodo className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">
                            Tasks
                        </h2>
                        <p className="text-xs font-medium text-muted-foreground">
                            {tasks.length} total
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-4 border-r px-4 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        <span
                            className="flex items-center gap-1.5"
                            title="To Do"
                        >
                            <div
                                className={cn(
                                    'h-2 w-2 rounded-full',
                                    STATUS_COLORS.todo.dot,
                                )}
                            />
                            To Do
                        </span>
                        <span
                            className="flex items-center gap-1.5"
                            title="In Progress"
                        >
                            <div
                                className={cn(
                                    'h-2 w-2 rounded-full',
                                    STATUS_COLORS.in_progress.dot,
                                )}
                            />
                            In Progress
                        </span>
                        <span
                            className="flex items-center gap-1.5"
                            title="Review"
                        >
                            <div
                                className={cn(
                                    'h-2 w-2 rounded-full',
                                    STATUS_COLORS.review.dot,
                                )}
                            />
                            Review
                        </span>
                        <span
                            className="flex items-center gap-1.5"
                            title="Done"
                        >
                            <div
                                className={cn(
                                    'h-2 w-2 rounded-full',
                                    STATUS_COLORS.done.dot,
                                )}
                            />
                            Done
                        </span>
                        <span
                            className="ml-1 flex items-center gap-1.5 border-l pl-4"
                            title="Milestones"
                        >
                            <Diamond className="h-3 w-3 fill-amber-500/20 text-amber-500" />
                            Milestone
                        </span>
                    </div>
                </div>
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={taskIds}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {visibleTasks.map((task) => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        depth={task.depth}
                                        hasChildren={task.hasChildren}
                                        isExpanded={expandedIds.has(task.id)}
                                        onToggleExpand={() =>
                                            toggleExpand(task.id)
                                        }
                                        onEditTask={onEditTask}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <Separator />
                    <AddTaskForm projectId={projectId} projectTasks={tasks} />
                </div>
            </div>
        </Card>
    );
}

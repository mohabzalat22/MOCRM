import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ListTodo, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';
import { AddTaskForm } from './AddTaskForm';
import { TaskItem } from './TaskItem';

interface TaskListProps {
    projectId: number;
    tasks: Task[];
}

const EMPTY_TASKS: Task[] = [];

export function TaskList({ projectId, tasks = EMPTY_TASKS }: TaskListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = tasks.findIndex((t) => t.id === active.id);
            const newIndex = tasks.findIndex((t) => t.id === over.id);

            const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
            
            taskService.reorderTasks(reorderedTasks.map((t, index) => ({
                id: t.id,
                order: index,
            })));
        }
    };

    const handleBulkComplete = () => {
        if (confirm('Mark all incomplete tasks as completed?')) {
            taskService.bulkComplete(tasks.filter(t => !t.completed).map(t => t.id));
        }
    };

    return (
        <Card className="flex flex-col h-[700px] shadow-sm border-border/60">
            <div className="p-6 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                        <ListTodo className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">Tasks</h2>
                        <p className="text-xs text-muted-foreground font-medium">
                            {tasks.length} total
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3 px-3 py-1 text-[11px] font-medium text-muted-foreground border-r">
                        <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-success/80" /> {tasks.filter(t => t.completed).length}</span>
                        <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary/80" /> {tasks.filter(t => !t.completed).length}</span>
                    </div>
                    {tasks.some(t => !t.completed) && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs font-semibold"
                            onClick={handleBulkComplete}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Bulk Complete
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar p-6">
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
                                {tasks.map((task) => (
                                    <TaskItem key={task.id} task={task} projectTasks={tasks} />
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

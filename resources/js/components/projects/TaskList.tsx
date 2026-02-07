import type {
    DragEndEvent} from '@dnd-kit/core';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';
import { AddTaskForm } from './AddTaskForm';
import { TaskItem } from './TaskItem';
import { TaskProgress } from './TaskProgress';

interface TaskListProps {
    projectId: number;
    initialTasks: Task[];
}

export function TaskList({ projectId, initialTasks }: TaskListProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === active.id);
                const newIndex = items.findIndex((t) => t.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);
                
                // Prepare reorder request
                const reorderData = newItems.map((task, index) => ({
                    id: task.id,
                    order: index,
                }));

                taskService.reorderTasks(reorderData);

                return newItems;
            });
        }
    };

    const handleBulkComplete = () => {
        const incompleteIds = tasks
            .filter((t) => !t.completed)
            .map((t) => t.id);
        
        if (incompleteIds.length === 0) return;

        taskService.bulkComplete(incompleteIds);
    };

    const completedCount = tasks.filter((t) => t.completed).length;
    const totalCount = tasks.length;

    return (
        <Card className="shadow-none border-none bg-transparent">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    Tasks
                    <span className="text-sm font-normal text-muted-foreground">
                        ({totalCount})
                    </span>
                </CardTitle>
                {tasks.some(t => !t.completed) && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handleBulkComplete}
                    >
                        <CheckCircle2 className="h-4 w-4" /> Mark all complete
                    </Button>
                )}
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                <TaskProgress completed={completedCount} total={totalCount} />

                <div className="space-y-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={tasks.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <AddTaskForm projectId={projectId} />
                </div>
            </CardContent>
        </Card>
    );
}

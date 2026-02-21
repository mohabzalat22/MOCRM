import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types/project';
import { TaskCard } from './TaskCard';

interface ColumnProps {
    column: {
        id: string;
        title: string;
    };
    tasks: Task[];
    onEditTask: (task: Task) => void;
}

export function Column({ column, tasks, onEditTask }: ColumnProps) {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
    });

    const taskIds = tasks.map((t) => t.id);

    return (
        <div className="flex h-full w-[300px] min-w-[300px] flex-col rounded-xl border bg-muted/40">
            <div className="flex items-center justify-between border-b bg-muted/20 p-4">
                <h3 className="text-sm font-semibold text-foreground">
                    {column.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                    {tasks.length}
                </Badge>
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto p-2">
                <div
                    ref={setNodeRef}
                    className="flex min-h-[100px] flex-col gap-3"
                >
                    <SortableContext
                        items={taskIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onEditTask={onEditTask}
                            />
                        ))}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
}

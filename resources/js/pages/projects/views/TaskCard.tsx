import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday } from 'date-fns';
import { Calendar, Diamond } from 'lucide-react';
import { PRIORITY_COLORS } from '@/components/projects/timeline/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/project';

interface TaskCardProps {
    task: Task;
    isOverlay?: boolean;
    onEditTask?: (task: Task) => void;
}

export function TaskCard({ task, isOverlay, onEditTask }: TaskCardProps) {
    const sortable = useSortable({
        id: task.id,
        disabled: isOverlay,
        data: {
            type: 'Task',
            task,
        },
    });

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = sortable;

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const isOverdue =
        task.due_date &&
        isPast(new Date(task.due_date)) &&
        !isToday(new Date(task.due_date)) &&
        task.status !== 'done';

    if (isDragging && !isOverlay) {
        return (
            <div
                ref={setNodeRef}
                className="h-[120px] rounded-xl border-2 border-dashed border-primary/30 bg-muted/20"
                style={style}
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative flex cursor-grab flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20 active:cursor-grabbing"
            onClick={() => onEditTask?.(task)}
        >
            <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 truncate text-sm leading-tight font-medium text-card-foreground">
                    {task.title}
                </span>
                <Badge
                    variant="outline"
                    className={cn(
                        'h-4 shrink-0 border-0 px-1.5 py-0 text-[10px] font-bold uppercase',
                        (
                            PRIORITY_COLORS[task.priority] ??
                            PRIORITY_COLORS.medium
                        ).bg,
                        (
                            PRIORITY_COLORS[task.priority] ??
                            PRIORITY_COLORS.medium
                        ).text,
                    )}
                >
                    {task.priority}
                </Badge>
            </div>

            {task.description && (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="mt-1 flex items-center justify-between gap-2">
                {task.is_milestone && (
                    <Badge
                        variant="outline"
                        className="h-5 gap-1 border-amber-500/40 bg-amber-500/5 px-1.5 text-[10px] text-amber-600"
                    >
                        <Diamond className="h-2.5 w-2.5 fill-amber-500/20" />
                        Milestone
                    </Badge>
                )}
                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    {task.due_date && (
                        <span
                            className={cn(
                                'flex items-center gap-1',
                                isOverdue && 'font-semibold text-destructive',
                            )}
                        >
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.due_date), 'MMM d')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

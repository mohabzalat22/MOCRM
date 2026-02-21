import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday } from 'date-fns';
import {
    Calendar,
    GripVertical,
    Diamond,
    Trash2,
    MoreHorizontal,
    Pencil,
    ChevronRight,
    ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';
import { STATUS_COLORS, PRIORITY_COLORS } from './timeline/constants';

interface TaskItemProps {
    task: Task;
    depth?: number;
    hasChildren?: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    onEditTask: (task: Task) => void;
}

export function TaskItem({
    task,
    depth = 0,
    hasChildren = false,
    isExpanded = false,
    onToggleExpand,
    onEditTask,
}: TaskItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${depth * 24}px`,
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            taskService.deleteTask(task.id);
        }
    };

    const isOverdue =
        task.due_date &&
        isPast(new Date(task.due_date)) &&
        !isToday(new Date(task.due_date)) &&
        task.status !== 'done';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-all',
                isDragging
                    ? 'z-50 border-primary/60 opacity-50 shadow-lg'
                    : 'hover:border-primary/30 hover:shadow-md',
                task.status === 'done' && 'opacity-60',
            )}
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Expand/Collapse */}
            {hasChildren ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 p-0 text-muted-foreground/50 hover:text-foreground"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand?.();
                    }}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                    )}
                </Button>
            ) : (
                <div className="w-5 shrink-0" />
            )}

            {/* Title & description */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    {task.is_milestone && (
                        <Diamond className="h-3.5 w-3.5 shrink-0 fill-amber-500/20 text-amber-500" />
                    )}
                    <span
                        className={cn(
                            'truncate text-sm leading-none font-medium',
                            task.status === 'done'
                                ? 'text-muted-foreground line-through'
                                : 'text-foreground',
                        )}
                    >
                        {task.title}
                    </span>
                </div>
            </div>

            {/* Badges */}
            <div className="flex shrink-0 items-center gap-2">
                {/* Priority Badge */}
                <Badge
                    variant="outline"
                    className={cn(
                        'border-0 px-1.5 py-0 text-[10px] font-bold uppercase',
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

                {/* Status badge */}
                <Badge
                    variant="outline"
                    className={cn(
                        'text-[10px] font-semibold capitalize',
                        (STATUS_COLORS[task.status] ?? STATUS_COLORS.todo)
                            .badge,
                    )}
                >
                    {task.status.replace('_', ' ')}
                </Badge>
            </div>

            {/* Dates */}
            <div className="hidden shrink-0 items-center gap-1 text-[10px] text-muted-foreground sm:flex">
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

            {/* 3-dot menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                        onClick={() => onEditTask(task)}
                        className="gap-2 text-sm"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleDelete}
                        className="gap-2 text-sm text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

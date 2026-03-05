import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical,
    Diamond,
    Trash2,
    MoreHorizontal,
    Pencil,
    ChevronRight,
    ChevronDown,
    Plus,
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
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { cn } from '@/lib/utils';
import { templateTaskService } from '@/services/templateTaskService';
import type { ProjectTemplateTask } from '@/types';
import { PRIORITY_COLORS, STATUS_COLORS } from '../projects/timeline/constants';

interface TemplateTaskItemProps {
    task: ProjectTemplateTask;
    depth?: number;
    hasChildren?: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    onEdit: (task: ProjectTemplateTask) => void;
    onAddSubtask: (parentId: number) => void;
}

export function TemplateTaskItem({
    task,
    depth = 0,
    hasChildren = false,
    isExpanded = false,
    onToggleExpand,
    onEdit,
    onAddSubtask,
}: TemplateTaskItemProps) {
    const { confirm, ConfirmDialog } = useConfirmDialog();
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
        confirm(
            () => {
                templateTaskService.deleteTask(task.id);
            },
            {
                title: 'Delete Task?',
                message: `Are you sure you want to delete "${task.title}"? This will permanently remove the task and any subtasks.`,
            },
        );
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-all',
                isDragging
                    ? 'z-50 border-primary/60 opacity-50 shadow-lg'
                    : 'hover:border-primary/30 hover:shadow-md',
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
                            'truncate text-sm leading-none font-medium text-foreground',
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

                {/* Status badge - Fixed as Todo for templates */}
                <Badge
                    variant="outline"
                    className={cn(
                        'text-[10px] font-semibold capitalize',
                        STATUS_COLORS.todo.badge,
                    )}
                >
                    To Do
                </Badge>
            </div>

            {/* Dates */}
            <div className="hidden shrink-0 items-center gap-1 text-[10px] text-muted-foreground sm:flex"></div>

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
                        onClick={() => onEdit(task)}
                        className="gap-2 text-sm"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => onAddSubtask(task.id)}
                        className="gap-2 text-sm"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Sub-task
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
            <ConfirmDialog />
        </div>
    );
}

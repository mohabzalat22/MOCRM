import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday } from 'date-fns';
import { Calendar, GripVertical, Milestone, Trash2, GitBranch } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';
import { Calendar as CalendarComponent } from '../ui/calendar';

interface TaskItemProps {
    task: Task;
    projectTasks?: Task[];
}

const EMPTY_TASKS: Task[] = [];

export function TaskItem({ task, projectTasks = EMPTY_TASKS }: TaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(task.description);

    const parentOptions = useMemo(() => 
        projectTasks.filter(t => t.id !== task.id),
    [projectTasks, task.id]);

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
    };

    const handleToggle = () => {
        taskService.toggleComplete(task.id);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            taskService.deleteTask(task.id);
        }
    };

    const handleUpdate = () => {
        if (description === task.description) {
            setIsEditing(false);
            return;
        }
        taskService.updateTask(task.id, { description }, {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleDateChange = (date: Date | undefined) => {
        taskService.updateTask(task.id, {
            due_date: date ? format(date, 'yyyy-MM-dd') : null,
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group flex items-center gap-3 p-2.5 rounded-lg border bg-card transition-colors',
                isDragging ? 'opacity-50 border-primary' : 'hover:bg-accent/50',
                task.completed && 'opacity-60'
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-primary transition-colors"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <Checkbox
                checked={task.completed}
                onCheckedChange={handleToggle}
                className="h-4 w-4"
            />

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <input
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-foreground"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                        autoFocus
                    />
                ) : (
                    <div className="flex items-center gap-2">
                        {task.is_milestone && (
                            <Milestone className="h-3.5 w-3.5 text-warning" />
                        )}
                        <p
                            className={cn(
                                'text-sm font-medium cursor-pointer truncate',
                                task.completed ? 'text-muted-foreground line-through' : 'text-foreground hover:text-primary transition-colors'
                            )}
                            onClick={() => setIsEditing(true)}
                        >
                            {task.description}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Parent Selection */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-7 w-7',
                                task.parent_id ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <GitBranch className="h-3.5 w-3.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-3 shadow-lg" align="end">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">Relate to</div>
                        <Select
                            value={task.parent_id?.toString() || "none"}
                            onValueChange={(value) => taskService.updateTask(task.id, { parent_id: value === "none" ? null : parseInt(value) })}
                        >
                            <SelectTrigger className="w-full h-8 text-xs font-medium bg-muted/40">
                                <SelectValue placeholder="Select parent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (Root)</SelectItem>
                                {parentOptions.map((t) => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            {t.is_milestone ? <Milestone className="h-3.5 w-3.5 text-warning" /> : <GitBranch className="h-3.5 w-3.5" />}
                                            <span className="truncate max-w-[140px] font-medium">{t.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </PopoverContent>
                </Popover>

                {/* Start Date */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-7 w-7',
                                task.start_date ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 shadow-lg" align="end">
                        <div className="p-2 border-b bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Start Date
                        </div>
                        <CalendarComponent
                            mode="single"
                            selected={task.start_date ? new Date(task.start_date) : undefined}
                            onSelect={(date: Date | undefined) => taskService.updateTask(task.id, { start_date: date ? format(date, 'yyyy-MM-dd') : null })}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                {/* Due Date */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-7 w-7',
                                task.due_date ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <div className="relative">
                                <Calendar className="h-3.5 w-3.5" />
                                {task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && !task.completed && (
                                    <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-destructive border border-background" />
                                )}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 shadow-lg" align="end">
                        <div className="p-2 border-b bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Due Date
                        </div>
                        <CalendarComponent
                            mode="single"
                            selected={task.due_date ? new Date(task.due_date) : undefined}
                            onSelect={handleDateChange}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-7 w-7",
                        task.is_milestone ? "text-warning bg-warning/5" : "text-muted-foreground"
                    )}
                    onClick={() => taskService.updateTask(task.id, { is_milestone: !task.is_milestone })}
                >
                    <Milestone className="h-3.5 w-3.5" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:text-destructive hover:bg-destructive/5"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
            
            <div className="flex items-center gap-2 pl-2 border-l ml-1 text-[10px] font-medium text-muted-foreground/60">
                {task.start_date && (
                    <span>{format(new Date(task.start_date), 'MMM d')}</span>
                )}
                {task.start_date && task.due_date && <span>-</span>}
                {task.due_date && (
                    <span className={cn(
                        isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && !task.completed && "text-destructive font-bold"
                    )}>
                        {format(new Date(task.due_date), 'MMM d')}
                    </span>
                )}
            </div>
        </div>
    );
}

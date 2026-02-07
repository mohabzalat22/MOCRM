import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Calendar, GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';

interface TaskItemProps {
    task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(task.description);

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
                'group flex items-center gap-3 p-2 rounded-lg border bg-card transition-colors',
                isDragging ? 'opacity-50 shadow-lg' : 'hover:bg-muted/50',
                task.completed && 'bg-muted/50'
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <Checkbox
                checked={task.completed}
                onCheckedChange={handleToggle}
                className="h-5 w-5"
            />

            <div className="flex-1">
                {isEditing ? (
                    <input
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                        autoFocus
                    />
                ) : (
                    <p
                        className={cn(
                            'text-sm cursor-pointer truncate',
                            task.completed && 'text-muted-foreground line-through'
                        )}
                        onClick={() => setIsEditing(true)}
                    >
                        {task.description}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'h-8 w-8 text-muted-foreground',
                                task.due_date && 'text-primary'
                            )}
                        >
                            <Calendar className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
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
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            
            {task.due_date && !task.completed && (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {format(new Date(task.due_date), 'MMM d')}
                </span>
            )}
        </div>
    );
}

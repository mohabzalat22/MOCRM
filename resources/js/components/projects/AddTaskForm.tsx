import { format } from 'date-fns';
import {
    Calendar as CalendarIcon,
    Diamond,
    Plus,
    GitBranch,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/project';

interface AddTaskFormProps {
    projectId: number;
    projectTasks?: Task[];
    onSuccess?: () => void;
    initialAdding?: boolean;
}

const EMPTY_TASKS: Task[] = [];

export function AddTaskForm({
    projectId,
    projectTasks = EMPTY_TASKS,
    onSuccess,
    initialAdding = false,
}: AddTaskFormProps) {
    const [isAdding, setIsAdding] = useState(initialAdding);
    const { data, setData, processing, reset, errors } =
        taskService.useTaskForm(projectId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        taskService.createTask(data, {
            onSuccess: () => {
                reset();
                setIsAdding(false);
                onSuccess?.();
            },
        });
    };

    if (!isAdding) {
        return (
            <div className="px-1">
                <Button
                    variant="ghost"
                    className="h-10 w-full justify-start gap-3 px-4 text-muted-foreground transition-colors hover:text-primary"
                    onClick={() => setIsAdding(true)}
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm font-medium">Add task</span>
                </Button>
            </div>
        );
    }

    return (
        <div className="px-1">
            <form
                onSubmit={handleSubmit}
                className="animate-in space-y-4 rounded-lg border bg-card/50 p-4 shadow-sm duration-300 fade-in slide-in-from-top-2"
            >
                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="ml-1 text-xs font-semibold text-muted-foreground">
                            Title
                        </Label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Task Title"
                            autoFocus
                            disabled={processing}
                            className={cn(
                                'h-9 text-sm font-medium',
                                errors.title &&
                                    'border-destructive focus-visible:ring-destructive',
                            )}
                        />
                        {errors.title && (
                            <p className="ml-1 text-[11px] font-medium text-destructive">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label className="ml-1 text-xs font-semibold text-muted-foreground">
                            Description
                        </Label>
                        <Textarea
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Details..."
                            disabled={processing}
                            className={cn(
                                'min-h-[80px] resize-none text-sm',
                                errors.description &&
                                    'border-destructive focus-visible:ring-destructive',
                            )}
                        />
                        {errors.description && (
                            <p className="ml-1 text-[11px] font-medium text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                            Start Date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        'h-9 w-full justify-start bg-muted/20 text-left font-medium',
                                        !data.start_date &&
                                            'text-muted-foreground/60',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />
                                    {data.start_date ? (
                                        format(
                                            new Date(data.start_date),
                                            'MMM d, yyyy',
                                        )
                                    ) : (
                                        <span>Start</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0 shadow-xl"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={
                                        data.start_date
                                            ? new Date(data.start_date)
                                            : undefined
                                    }
                                    onSelect={(date) =>
                                        setData(
                                            'start_date',
                                            date
                                                ? format(date, 'yyyy-MM-dd')
                                                : null,
                                        )
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                            Due Date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        'h-9 w-full justify-start bg-muted/20 text-left font-medium',
                                        !data.due_date &&
                                            'text-muted-foreground/60',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />
                                    {data.due_date ? (
                                        format(
                                            new Date(data.due_date),
                                            'MMM d, yyyy',
                                        )
                                    ) : (
                                        <span>End</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0 shadow-xl"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={
                                        data.due_date
                                            ? new Date(data.due_date)
                                            : undefined
                                    }
                                    onSelect={(date) =>
                                        setData(
                                            'due_date',
                                            date
                                                ? format(date, 'yyyy-MM-dd')
                                                : null,
                                        )
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                            Priority
                        </Label>
                        <Select
                            value={data.priority}
                            onValueChange={(value) =>
                                setData('priority', value)
                            }
                        >
                            <SelectTrigger className="h-9 w-full bg-muted/20 text-xs font-medium">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="ml-1 text-[11px] font-semibold text-muted-foreground">
                        Parent
                    </Label>
                    <Select
                        value={data.parent_id?.toString() || 'none'}
                        onValueChange={(value) =>
                            setData(
                                'parent_id',
                                value === 'none' ? null : parseInt(value),
                            )
                        }
                    >
                        <SelectTrigger className="h-9 w-full bg-muted/20 text-xs font-medium">
                            <SelectValue placeholder="Parent task" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None (Root)</SelectItem>
                            {projectTasks.map((task) => (
                                <SelectItem
                                    key={task.id}
                                    value={task.id.toString()}
                                >
                                    <div className="flex items-center gap-2">
                                        {task.is_milestone ? (
                                            <Diamond className="h-3.5 w-3.5 fill-warning/20 text-warning" />
                                        ) : (
                                            <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                        <span className="max-w-[150px] truncate font-medium">
                                            {task.title}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="group flex items-center gap-3 rounded-md px-3 py-1.5 transition-colors hover:bg-muted/50">
                        <Checkbox
                            id="is_milestone_add"
                            checked={data.is_milestone}
                            onCheckedChange={(checked) =>
                                setData('is_milestone', checked as boolean)
                            }
                            className="h-4 w-4"
                        />
                        <Label
                            htmlFor="is_milestone_add"
                            className="flex flex-1 cursor-pointer items-center gap-2 py-1 text-xs font-medium"
                        >
                            <Diamond
                                className={cn(
                                    'h-3.5 w-3.5 transition-colors',
                                    data.is_milestone
                                        ? 'fill-warning/20 text-warning'
                                        : 'text-muted-foreground/40',
                                )}
                            />
                            <span>Milestone Task</span>
                        </Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 text-xs font-semibold"
                            onClick={() => {
                                setIsAdding(false);
                                reset();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.title.trim()}
                            size="sm"
                            className="h-9 px-6 text-xs font-bold"
                        >
                            Save Task
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

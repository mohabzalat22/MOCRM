import { format } from 'date-fns';
import { Calendar as CalendarIcon, GitBranch, Diamond } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import type { Task } from '@/types/project';

const statusOptions = [
    {
        value: 'todo',
        label: 'To Do',
        color: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    {
        value: 'in_progress',
        label: 'In Progress',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
        value: 'review',
        label: 'Review',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    {
        value: 'done',
        label: 'Done',
        color: 'bg-green-100 text-green-800 border-green-200',
    },
    {
        value: 'blocked',
        label: 'Blocked',
        color: 'bg-red-100 text-red-800 border-red-200',
    },
];

const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-red-500' },
];

export function TaskBasicFields({
    title,
    setTitle,
    description,
    setDescription,
}: {
    title: string;
    setTitle: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
}) {
    return (
        <>
            <div className="space-y-1.5">
                <Label
                    htmlFor="task-title"
                    className="text-xs font-semibold text-muted-foreground"
                >
                    Title <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title..."
                    className="h-9"
                />
            </div>

            <div className="space-y-1.5">
                <Label
                    htmlFor="task-desc"
                    className="text-xs font-semibold text-muted-foreground"
                >
                    Description
                </Label>
                <Textarea
                    id="task-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details..."
                    className="min-h-[120px] w-full text-sm break-words"
                />
            </div>
        </>
    );
}

export function TaskStatusPriorityFields({
    status,
    setStatus,
    priority,
    setPriority,
}: {
    status: string;
    setStatus: (v: string) => void;
    priority: string;
    setPriority: (v: string) => void;
}) {
    const currentStatus = statusOptions.find((s) => s.value === status);
    const currentPriority = priorityOptions.find((p) => p.value === priority);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                    Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 text-xs">
                        <SelectValue>
                            {currentStatus && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'text-[10px] font-semibold capitalize',
                                        currentStatus.color,
                                    )}
                                >
                                    {currentStatus.label}
                                </Badge>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'text-[10px] font-semibold capitalize',
                                        s.color,
                                    )}
                                >
                                    {s.label}
                                </Badge>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                    Priority
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-9 text-xs">
                        <SelectValue>
                            {currentPriority && (
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            'h-2 w-2 rounded-full',
                                            currentPriority.color,
                                        )}
                                    />
                                    <span className="capitalize">
                                        {currentPriority.label}
                                    </span>
                                </div>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {priorityOptions.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(
                                            'h-2 w-2 rounded-full',
                                            p.color,
                                        )}
                                    />
                                    <span className="capitalize">
                                        {p.label}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export function TaskDateFields({
    startDate,
    setStartDate,
    dueDate,
    setDueDate,
}: {
    startDate: Date | undefined;
    setStartDate: (d: Date | undefined) => void;
    dueDate: Date | undefined;
    setDueDate: (d: Date | undefined) => void;
}) {
    const isInvalidRange = startDate && dueDate && startDate > dueDate;

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label
                    className={cn(
                        'text-xs font-semibold',
                        isInvalidRange
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                    )}
                >
                    Start Date
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-9 w-full justify-start text-left font-normal',
                                !startDate && 'text-muted-foreground',
                                isInvalidRange &&
                                    'border-destructive/50 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive',
                            )}
                        >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-60" />
                            {startDate
                                ? format(startDate, 'MMM d, yyyy')
                                : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                        />
                        {startDate && (
                            <div className="border-t p-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-full text-xs text-muted-foreground"
                                    onClick={() => setStartDate(undefined)}
                                >
                                    Clear date
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-1.5">
                <Label
                    className={cn(
                        'text-xs font-semibold',
                        isInvalidRange
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                    )}
                >
                    Due Date
                </Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                'h-9 w-full justify-start text-left font-normal',
                                !dueDate && 'text-muted-foreground',
                                isInvalidRange &&
                                    'border-destructive/50 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive',
                            )}
                        >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-60" />
                            {dueDate
                                ? format(dueDate, 'MMM d, yyyy')
                                : 'Pick a date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={setDueDate}
                            initialFocus
                        />
                        {dueDate && (
                            <div className="border-t p-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-full text-xs text-muted-foreground"
                                    onClick={() => setDueDate(undefined)}
                                >
                                    Clear date
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>
            {isInvalidRange && (
                <p className="col-span-2 text-[10px] font-medium text-destructive">
                    Start date cannot be after due date
                </p>
            )}
        </div>
    );
}

export function TaskParentMilestoneFields({
    parentId,
    setParentId,
    isMilestone,
    setIsMilestone,
    projectTasks,
    taskId,
}: {
    parentId: string;
    setParentId: (v: string) => void;
    isMilestone: boolean;
    setIsMilestone: (v: boolean) => void;
    projectTasks: Task[];
    taskId: number;
}) {
    const parentOptions = projectTasks.filter((t) => t.id !== taskId);

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                    Parent Task
                </Label>
                <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="No parent (root task)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">
                            <span className="text-muted-foreground">
                                None (root task)
                            </span>
                        </SelectItem>
                        {parentOptions.map((t) => (
                            <SelectItem key={t.id} value={t.id.toString()}>
                                <div className="flex items-center gap-2">
                                    {t.is_milestone ? (
                                        <Diamond className="h-3.5 w-3.5 fill-warning/20 text-warning" />
                                    ) : (
                                        <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                    <span className="max-w-[200px] truncate">
                                        {t.title}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div
                className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                    isMilestone
                        ? 'border-warning/40 bg-warning/5'
                        : 'border-border hover:bg-muted/30',
                )}
                onClick={() => setIsMilestone(!isMilestone)}
            >
                <Checkbox
                    id="is-milestone"
                    checked={isMilestone}
                    onCheckedChange={(v) => setIsMilestone(Boolean(v))}
                    onClick={(e) => e.stopPropagation()}
                />
                <div className="flex flex-1 items-center gap-2">
                    <Diamond
                        className={cn(
                            'h-4 w-4 transition-colors',
                            isMilestone
                                ? 'fill-warning/20 text-warning'
                                : 'text-muted-foreground/40',
                        )}
                    />
                    <div>
                        <Label
                            htmlFor="is-milestone"
                            className="cursor-pointer text-sm font-medium"
                        >
                            Mark as Milestone
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Milestone tasks appear with a special indicator on
                            the timeline.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

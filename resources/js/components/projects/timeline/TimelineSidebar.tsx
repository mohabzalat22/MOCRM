import { isPast, isToday } from 'date-fns';
import { ChevronRight, Diamond } from 'lucide-react';
import type { RefObject } from 'react';
import { cn } from '@/lib/utils';
import type { Task } from '@/types/project';
import { HEADER_HEIGHT, ROW_HEIGHT, STATUS_COLORS } from './constants';

interface TimelineSidebarProps {
    visibleTasks: { task: Task; depth: number; hasChildren: boolean }[];
    collapsed: Record<number, boolean>;
    toggleCollapse: (taskId: number) => void;
    scrollSidebarRef: RefObject<HTMLDivElement | null>;
    onSidebarScroll: () => void;
    onEditTask: (task: Task) => void;
}

export function TimelineSidebar({
    visibleTasks,
    collapsed,
    toggleCollapse,
    scrollSidebarRef,
    onSidebarScroll,
    onEditTask,
}: TimelineSidebarProps) {
    return (
        <div className="relative flex w-[260px] shrink-0 flex-col border-r bg-muted/10">
            {/* Sidebar header cell */}
            <div
                className="flex shrink-0 items-center border-b bg-muted/30 px-4"
                style={{ height: HEADER_HEIGHT }}
            >
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    Task Name
                </span>
            </div>

            {/* Sidebar rows */}
            <div
                ref={scrollSidebarRef}
                className="hide-scrollbar flex-1 overflow-y-auto"
                onScroll={onSidebarScroll}
            >
                {visibleTasks.map(({ task, depth, hasChildren }) => {
                    const isLate =
                        task.due_date &&
                        isPast(new Date(task.due_date)) &&
                        !isToday(new Date(task.due_date)) &&
                        task.status !== 'done';

                    return (
                        <div
                            key={task.id}
                            className="group flex items-center gap-1 border-b pr-2 transition-colors hover:bg-muted/20"
                            style={{
                                height: ROW_HEIGHT,
                                paddingLeft: `${depth * 16 + 12}px`,
                            }}
                        >
                            {/* Expand/collapse */}
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleCollapse(task.id)}
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <ChevronRight
                                        className={cn(
                                            'h-3.5 w-3.5 transition-transform',
                                            !collapsed[task.id] && 'rotate-90',
                                        )}
                                    />
                                </button>
                            ) : (
                                <div className="w-5 shrink-0" />
                            )}

                            {/* Status and Milestone indicators */}
                            <div className="flex shrink-0 items-center gap-1.5">
                                {task.is_milestone ? (
                                    <Diamond className="h-3 w-3 fill-amber-500/20 text-amber-500" />
                                ) : (
                                    <div
                                        className={cn(
                                            'h-2 w-2 rounded-full',
                                            isLate && task.status !== 'done'
                                                ? 'bg-destructive'
                                                : STATUS_COLORS[task.status]
                                                      ?.dot || 'bg-slate-400',
                                        )}
                                    />
                                )}
                            </div>

                            {/* Title — click to edit */}
                            <button
                                className={cn(
                                    'min-w-0 flex-1 truncate text-left text-[13px] font-medium transition-colors',
                                    task.status === 'done'
                                        ? 'text-muted-foreground line-through decoration-muted-foreground/40'
                                        : isLate
                                          ? 'text-destructive'
                                          : 'text-foreground hover:text-primary',
                                    task.is_milestone && 'font-semibold italic',
                                )}
                                onClick={() => onEditTask(task)}
                                title={task.title}
                            >
                                {task.title}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

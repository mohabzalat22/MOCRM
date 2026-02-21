import { useTimelineDisplay } from '@/hooks/use-timeline-display';
import { useTimelineScroll } from '@/hooks/use-timeline-scroll';
import { useVisibleTasks } from '@/hooks/use-visible-tasks';
import type { Task } from '@/types/project';
import { TimelineGanttBody } from './timeline/TimelineGanttBody';
import { TimelineHeader } from './timeline/TimelineHeader';
import { TimelineSidebar } from './timeline/TimelineSidebar';
import { TimelineToolbar } from './timeline/TimelineToolbar';

interface ProjectTimelineProps {
    tasks: Task[];
    projectStartDate: string;
    projectEndDate?: string;
    onEditTask: (task: Task) => void;
}

export function ProjectTimeline({
    tasks,
    projectStartDate,
    projectEndDate,
    onEditTask,
}: ProjectTimelineProps) {
    const {
        viewDate,
        setViewDate,
        zoomLevel,
        displayRange,
        todayOffset,
        totalWidth,
        zoomIn,
        zoomOut,
    } = useTimelineDisplay(projectStartDate);

    const {
        scrollBodyRef,
        scrollHeaderRef,
        scrollSidebarRef,
        onBodyScroll,
        onHeaderScroll,
        onSidebarScroll,
        onBodyVerticalScroll,
    } = useTimelineScroll();

    const { visibleTasks, collapsed, toggleCollapse } = useVisibleTasks(tasks);

    return (
        <>
            <div className="flex h-[680px] flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
                <TimelineToolbar
                    viewDate={viewDate}
                    setViewDate={setViewDate}
                    zoomLevel={zoomLevel}
                    zoomIn={zoomIn}
                    zoomOut={zoomOut}
                />

                <div className="flex min-h-0 flex-1 overflow-hidden">
                    <TimelineSidebar
                        visibleTasks={visibleTasks}
                        collapsed={collapsed}
                        toggleCollapse={toggleCollapse}
                        scrollSidebarRef={scrollSidebarRef}
                        onSidebarScroll={onSidebarScroll}
                        onEditTask={onEditTask}
                    />

                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                        <TimelineHeader
                            displayRange={displayRange}
                            zoomLevel={zoomLevel}
                            totalWidth={totalWidth}
                            scrollHeaderRef={scrollHeaderRef}
                            onHeaderScroll={onHeaderScroll}
                        />

                        <TimelineGanttBody
                            visibleTasks={visibleTasks}
                            displayRange={displayRange}
                            zoomLevel={zoomLevel}
                            todayOffset={todayOffset}
                            projectEndDate={projectEndDate}
                            totalWidth={totalWidth}
                            scrollBodyRef={scrollBodyRef}
                            onScroll={() => {
                                onBodyScroll();
                                onBodyVerticalScroll();
                            }}
                            onEditTask={onEditTask}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

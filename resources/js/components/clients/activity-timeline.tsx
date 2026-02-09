import { History } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { processActivities, getDefaultExpandedIds } from '@/lib/activity-utils';
import { exportTimelineToPDF } from '@/lib/timeline-pdf-exporter';
import type { Activity, ActivityType, Client } from '@/types';
import ActivityItem from './activity-item';
import DateGroupHeader from './date-group-header';
import TimelineFilters from './timeline-filters';

interface ActivityTimelineProps {
    activities: Activity[];
    savedActivities?: Activity[];
    client: Client;
    hideFilters?: boolean;
    hideExport?: boolean;
    allowedTypes?: Set<ActivityType>;
}

export default function ActivityTimeline({
    activities,
    savedActivities,
    client,
    hideFilters,
    hideExport,
    allowedTypes,
}: ActivityTimelineProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<Set<ActivityType>>(
        new Set(),
    );

    // Filter activities by allowed types if specified
    const displayActivities = useMemo(() => {
        if (!allowedTypes) return activities;
        return activities.filter((a) => allowedTypes.has(a.type));
    }, [activities, allowedTypes]);

    const [expandedIds, setExpandedIds] = useState<Set<number>>(() =>
        getDefaultExpandedIds(displayActivities),
    );

    // Process activities (filter, search, group)
    const groupedActivities = useMemo(
        () => processActivities(displayActivities, selectedTypes, searchQuery),
        [displayActivities, selectedTypes, searchQuery],
    );

    // Calculate filtered count
    const filteredCount = useMemo(
        () =>
            groupedActivities.reduce(
                (sum, group) => sum + group.activities.length,
                0,
            ),
        [groupedActivities],
    );

    // Handle filter toggles
    const handleTypeToggle = (type: ActivityType) => {
        setSelectedTypes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedTypes(new Set());
    };

    const handleToggleExpand = (activityId: number) => {
        setExpandedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(activityId)) {
                newSet.delete(activityId);
            } else {
                newSet.add(activityId);
            }
            return newSet;
        });
    };

    const handleExport = () => {
        const sourceActivities = savedActivities || [];

        // We need to apply the same filters to the source activities
        // processActivities returns groups, so we flatten them back
        const processedGroups = processActivities(
            sourceActivities,
            selectedTypes,
            searchQuery,
        );

        const activitiesToExport = processedGroups.flatMap(
            (group) => group.activities,
        );

        if (activitiesToExport.length === 0) {
            toast.error('No activities to export matching current filters.');
            return;
        }

        exportTimelineToPDF(activitiesToExport, client);
    };

    if (!activities || activities.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <History className="mb-2 h-10 w-10 opacity-20" />
                    <p>No activity recorded yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5" />
                    Activity Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0">
                {/* Filters */}
                <TimelineFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedTypes={selectedTypes}
                    onTypeToggle={handleTypeToggle}
                    onClearFilters={handleClearFilters}
                    onExport={!hideExport ? handleExport : undefined}
                    totalActivities={displayActivities.length}
                    filteredCount={filteredCount}
                    hideFilters={hideFilters}
                    hideExport={hideExport}
                />

                {/* Grouped Timeline */}
                {groupedActivities.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <History className="mb-2 h-10 w-10 opacity-20" />
                            <p>No activities match your filters.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {groupedActivities.map((group) => (
                            <div key={group.group}>
                                <DateGroupHeader
                                    label={group.label}
                                    count={group.activities.length}
                                />
                                <div className="flex flex-col">
                                    {group.activities.map((activity) => (
                                        <ActivityItem
                                            key={activity.id}
                                            activity={activity}
                                            isExpanded={expandedIds.has(
                                                activity.id,
                                            )}
                                            onToggleExpand={() =>
                                                handleToggleExpand(activity.id)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

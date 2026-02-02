import { History } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    processActivities,
    getDefaultExpandedIds,
} from '@/lib/activity-utils';
import { exportTimelineToPDF } from '@/lib/timeline-pdf-exporter';
import type { Activity, ActivityType } from '@/types';
import ActivityItem from './activity-item';
import DateGroupHeader from './date-group-header';
import TimelineFilters from './timeline-filters';

interface ActivityTimelineProps {
    activities: Activity[];
    clientName?: string;
}

export default function ActivityTimeline({
    activities,
    clientName = 'Client',
}: ActivityTimelineProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<Set<ActivityType>>(
        new Set(),
    );
    const [expandedIds, setExpandedIds] = useState<Set<number>>(() =>
        getDefaultExpandedIds(activities),
    );

    // Process activities (filter, search, group)
    const groupedActivities = useMemo(
        () => processActivities(activities, selectedTypes, searchQuery),
        [activities, selectedTypes, searchQuery],
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
        // Get the filtered activities for export
        const activitiesToExport = groupedActivities.flatMap(
            (group) => group.activities,
        );
        exportTimelineToPDF(activitiesToExport, clientName);
    };

    if (!activities || activities.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <History className="h-10 w-10 mb-2 opacity-20" />
                    <p>No activity recorded yet.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Activity Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                {/* Filters */}
                <TimelineFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedTypes={selectedTypes}
                    onTypeToggle={handleTypeToggle}
                    onClearFilters={handleClearFilters}
                    onExport={handleExport}
                    totalActivities={activities.length}
                    filteredCount={filteredCount}
                />

                {/* Grouped Timeline */}
                {groupedActivities.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <History className="h-10 w-10 mb-2 opacity-20" />
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

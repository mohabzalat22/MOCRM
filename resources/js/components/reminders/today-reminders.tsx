import { Link } from '@inertiajs/react';
import { Bell, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Reminder } from '@/types';

interface TodayRemindersProps {
    reminders: Reminder[];
}

export function TodayReminders({ reminders }: TodayRemindersProps) {
    return (
        <Card className="flex h-full flex-col overflow-hidden border-sidebar-border/70 bg-white dark:bg-transparent shadow-sm dark:border-sidebar-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Bell className="h-4 w-4 text-primary" />
                    Today's Reminders
                </CardTitle>
                <Link href="/reminders">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                        View all
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                {reminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className="mb-2 h-8 w-8 text-muted-foreground/50" />
                        <p className="px-4 text-sm text-muted-foreground">
                            No reminders scheduled for today.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {reminders.map((reminder) => (
                            <div
                                key={reminder.id}
                                className="p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 space-y-1">
                                        <p className="truncate text-sm leading-none font-medium">
                                            {reminder.title}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {new Date(
                                                reminder.reminder_at,
                                            ).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                            {reminder.remindable_type && (
                                                <>
                                                    <span className="h-1 w-1 rounded-full bg-border" />
                                                    <span className="truncate">
                                                        {reminder.remindable_type
                                                            .split('\\')
                                                            .pop()}
                                                        :{' '}
                                                        {reminder.remindable
                                                            ?.name || 'Unknown'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            reminder.priority === 'high'
                                                ? 'destructive'
                                                : reminder.priority === 'medium'
                                                  ? 'default'
                                                  : 'secondary'
                                        }
                                        className="h-5 text-[10px] capitalize"
                                    >
                                        {reminder.priority}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { UserX, Clock, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Client } from '@/types';

interface AtRiskClientsListProps {
    clients: Client[];
}

export function AtRiskClientsList({ clients }: AtRiskClientsListProps) {
    return (
        <Card className="flex h-full flex-col overflow-hidden border-none bg-transparent shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <UserX className="h-4 w-4 text-destructive" />
                    At Risk Clients
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                {clients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <UserX className="mb-2 h-8 w-8 text-muted-foreground/50" />
                        <p className="px-4 text-sm text-muted-foreground">
                            No at-risk clients found.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {clients.map((client) => {
                            const lastActivity = client.activities?.[0];
                            return (
                                <div
                                    key={client.id}
                                    className="p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="min-w-0 space-y-1">
                                        <Link
                                            href={`/clients/${client.id}`}
                                            className="truncate text-sm font-medium hover:underline"
                                        >
                                            {client.name}
                                        </Link>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {lastActivity
                                                        ? `Last sync ${formatDistanceToNow(new Date(lastActivity.created_at))} ago`
                                                        : 'No activity recorded'}
                                                </span>
                                            </div>
                                            {client.phone && (
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    <span className="truncate">
                                                        {client.phone}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import { MessageSquare, Briefcase, Bell, UserPlus } from 'lucide-react';
import { useState } from 'react';
import ActivityForm from '@/components/clients/activity-form';
import { ClientDialog } from '@/components/clients/dialog';
import { ProjectForm } from '@/components/projects/project-form';
import { ReminderForm } from '@/components/reminders/reminder-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
    clients: { id: number; name: string }[];
}

export function QuickActions({ clients }: QuickActionsProps) {
    const [activeDialog, setActiveDialog] = useState<'activity' | 'project' | 'reminder' | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>('');

    const actions = [
        {
            title: 'Add New Client',
            icon: UserPlus,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            hoverBorder: 'hover:border-blue-500/50',
            component: <ClientDialog />,
            isCustom: true,
        },
        {
            title: 'Log Activity',
            icon: MessageSquare,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            hoverBorder: 'hover:border-green-500/50',
            onClick: () => setActiveDialog('activity'),
        },
        {
            title: 'Create Project',
            icon: Briefcase,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
            hoverBorder: 'hover:border-purple-500/50',
            onClick: () => setActiveDialog('project'),
        },
        {
            title: 'Set Reminder',
            icon: Bell,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            hoverBorder: 'hover:border-orange-500/50',
            onClick: () => setActiveDialog('reminder'),
        },
    ];

    return (
        <Card className="border-sidebar-border/70 bg-card/50 backdrop-blur-sm dark:border-sidebar-border">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                <p className="text-xs text-muted-foreground">Frequent tasks at your fingertips</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {actions.map((action) => (
                        action.isCustom ? (
                            <ClientDialog 
                                key={action.title}
                                trigger={
                                    <div className={cn(
                                        "flex flex-col items-center justify-center p-4 rounded-xl border border-sidebar-border/70 bg-background/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
                                        action.hoverBorder
                                    )}>
                                        <div className={cn("rounded-full p-3 mb-3", action.bgColor)}>
                                            <action.icon className={cn("size-6", action.color)} />
                                        </div>
                                        <span className="text-sm font-medium text-center">{action.title}</span>
                                    </div>
                                }
                            />
                        ) : (
                            <button
                                key={action.title}
                                onClick={action.onClick}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-xl border border-sidebar-border/70 bg-background/50 transition-all duration-200 shadow-sm hover:shadow-md",
                                    action.hoverBorder
                                )}
                            >
                                <div className={cn("rounded-full p-3 mb-3", action.bgColor)}>
                                    <action.icon className={cn("size-6", action.color)} />
                                </div>
                                <span className="text-sm font-medium text-center">{action.title}</span>
                            </button>
                        )
                    ))}
                </div>
            </CardContent>

            {/* Log Activity Dialog */}
            <Dialog open={activeDialog === 'activity'} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Log Activity</DialogTitle>
                        <DialogDescription>
                            Record a new interaction with a client.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2 px-4">
                            <Label htmlFor="quick-activity-client">Select Client *</Label>
                            <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                                <SelectTrigger id="quick-activity-client">
                                    <SelectValue placeholder="Which client?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedClientId && (
                            <ActivityForm 
                                clientId={selectedClientId}
                                enableImmediateSave={true}
                                onSuccess={() => {
                                    setActiveDialog(null);
                                    setSelectedClientId('');
                                }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Project Dialog */}
            <Dialog open={activeDialog === 'project'} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Start a new project for one of your clients.
                        </DialogDescription>
                    </DialogHeader>
                    <ProjectForm 
                        clients={clients}
                        onSuccess={() => setActiveDialog(null)}
                    />
                </DialogContent>
            </Dialog>

            {/* Set Reminder Dialog */}
            <Dialog open={activeDialog === 'reminder'} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Set Reminder</DialogTitle>
                        <DialogDescription>
                            Schedule a follow-up or a task.
                        </DialogDescription>
                    </DialogHeader>
                    <ReminderForm 
                        clients={clients}
                        onSuccess={() => setActiveDialog(null)}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}

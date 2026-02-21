import ClientImageUpload from '@/components/clients/client-image';
import QuickActions from '@/components/clients/quick-actions';
import SettingButton from '@/components/clients/setting-button';
import StatusButton from '@/components/clients/status-button';
import { Separator } from '@/components/ui/separator';
import type { Client } from '@/types';

interface ClientHeaderProps {
    client: Client;
}

export default function ClientHeader({ client }: ClientHeaderProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="relative flex flex-col gap-6 p-6">
                {/* Profile Image & Basic Info - Horizontal Layout */}
                <div className="flex flex-row items-center gap-5 text-left">
                    <div className="shrink-0">
                        <ClientImageUpload />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                        <h1 className="truncate text-xl font-bold tracking-tight text-foreground capitalize">
                            {client.name}
                        </h1>
                        <div className="flex flex-col items-start gap-1 pt-0.5">
                            {client.company_name && (
                                <p className="truncate text-sm font-semibold text-muted-foreground">
                                    {client.company_name}
                                </p>
                            )}
                            <p className="text-[11px] font-medium text-muted-foreground/60">
                                Joined at{' '}
                                {new Date(client.created_at).toLocaleDateString(
                                    'en-US',
                                    {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    },
                                )}
                            </p>
                            <div className="pt-1.5">
                                <StatusButton />
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="flex justify-center">
                    <QuickActions client={client} />
                </div>

                {/* Settings Button - absolute positioned */}
                <div className="absolute top-4 right-4">
                    <SettingButton />
                </div>
            </div>
        </div>
    );
}

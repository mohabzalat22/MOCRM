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
        <div className="relative overflow-hidden rounded-2xl border bg-linear-to-br from-card via-card to-muted/20 shadow-xl">
            {/* Decorative background pattern */}
            <div className="bg-grid-pattern absolute inset-0 opacity-[0.02]" />

            <div className="relative flex flex-col items-center gap-6 p-6 md:flex-row md:items-start md:gap-8 md:p-10">
                {/* Profile Image Section */}
                <div className="shrink-0">
                    <ClientImageUpload />
                </div>

                {/* Client Information */}
                <div className="flex-1 space-y-4 text-center md:space-y-6 md:text-left">
                    {/* Name and Company */}
                    <div className="space-y-1 md:space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl capitalize">
                            {client.name}
                        </h1>
                        {client.company_name && (
                            <div className="flex items-center justify-center  md:justify-start">
                                <div className="h-1 w-1 rounded-full bg-primary md:h-1.5 md:w-1.5" />
                                <p className="text-lg my-auto ms-2 font-semibold text-muted-foreground md:text-xl">
                                    {client.company_name}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Status and Member Info */}
                    <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start md:gap-4">
                        <StatusButton />
                        <Separator
                            orientation="vertical"
                            className="hidden h-5 md:block"
                        />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground md:text-base">
                            <span className="font-medium">Joined</span>
                            <span className="font-semibold text-foreground">
                                {new Date(client.created_at).toLocaleDateString(
                                    'en-US',
                                    {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    },
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-1 md:pt-2">
                        <QuickActions client={client} />
                    </div>
                </div>

                {/* Settings Button */}
                <div className="absolute top-4 right-4 md:relative md:top-0 md:right-0 md:mt-0">
                    <SettingButton />
                </div>
            </div>
        </div>
    );
}

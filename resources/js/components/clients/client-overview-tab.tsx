import ClientForm from '@/components/clients/client-form';
import CustomFieldsView from '@/components/clients/custom-fields-view';
import TagInput from '@/components/clients/tag-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Client } from '@/types';

interface ClientOverviewTabProps {
    client: Client;
}

export default function ClientOverviewTab({ client }: ClientOverviewTabProps) {
    return (
        <div className="space-y-6">
            {/* Contact Information */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                        Contact Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ClientForm />
                </CardContent>
            </Card>

            {/* Additional Details (Custom Fields) */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                        Additional Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomFieldsView />
                </CardContent>
            </Card>

            {/* Organization & Tags */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                        Organization
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
                            Tags
                        </h3>
                        <TagInput />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
                            System Info
                        </h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">ID</span>
                            <span className="font-mono text-xs">
                                #{client.id}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Joined
                            </span>
                            <span>
                                {new Date(client.created_at).toLocaleDateString(
                                    'en-US',
                                    {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    },
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Updated
                            </span>
                            <span>
                                {new Date(client.updated_at).toLocaleDateString(
                                    'en-US',
                                    {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    },
                                )}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

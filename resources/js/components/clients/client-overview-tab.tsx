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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content - 2 spans */}
            <div className="space-y-6 lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ClientForm />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CustomFieldsView />
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar - 1 span */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Organization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Tags
                            </h3>
                            <TagInput />
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                System Info
                            </h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    ID
                                </span>
                                <span className="font-mono">#{client.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Updated
                                </span>
                                <span>
                                    {new Date(
                                        client.updated_at,
                                    ).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

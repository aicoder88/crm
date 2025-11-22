import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Plus, TrendingUp } from 'lucide-react';

export default async function CampaignsPage() {
    const supabase = await createClient();

    const { data: campaigns, error } = await supabase
        .from('email_campaigns')
        .select(`
      *,
      template:email_templates(name)
    `)
        .order('created_at', { ascending: false });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent':
                return 'default';
            case 'sending':
                return 'secondary';
            case 'scheduled':
                return 'outline';
            case 'draft':
                return 'outline';
            default:
                return 'outline';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Email Campaigns</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage bulk email campaigns
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Campaign
                </Button>
            </div>

            {error && (
                <div className="p-4 border border-red-500 bg-red-500/10 rounded-lg">
                    <p className="text-red-500">Failed to load campaigns: {error.message}</p>
                </div>
            )}

            {!campaigns || campaigns.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Send className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Create your first campaign to send bulk emails
                        </p>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Campaign
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => {
                        const openRate = campaign.recipient_count > 0
                            ? ((campaign.opened_count / campaign.recipient_count) * 100).toFixed(1)
                            : '0';
                        const clickRate = campaign.recipient_count > 0
                            ? ((campaign.clicked_count / campaign.recipient_count) * 100).toFixed(1)
                            : '0';

                        return (
                            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <Send className="h-8 w-8 text-violet-500" />
                                        <Badge variant={getStatusColor(campaign.status)}>
                                            {campaign.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-4">{campaign.name}</CardTitle>
                                    <CardDescription className="line-clamp-1">
                                        {campaign.template?.name || 'No template'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Recipients</p>
                                            <p className="text-2xl font-bold">{campaign.recipient_count}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Open Rate</p>
                                            <p className="text-2xl font-bold">{openRate}%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground border-t pt-3">
                                        {campaign.scheduled_date && campaign.status === 'scheduled' && (
                                            <div>
                                                <span className="font-medium">Scheduled:</span>{' '}
                                                {new Date(campaign.scheduled_date).toLocaleString()}
                                            </div>
                                        )}
                                        {campaign.sent_date && (
                                            <div>
                                                <span className="font-medium">Sent:</span>{' '}
                                                {new Date(campaign.sent_date).toLocaleString()}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 text-xs">
                                            <span>Clicked: {clickRate}%</span>
                                            <span>Bounced: {campaign.bounced_count}</span>
                                        </div>
                                    </div>

                                    <Button variant="outline" size="sm" className="w-full mt-4">
                                        <TrendingUp className="mr-2 h-3 w-3" />
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

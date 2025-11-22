import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Mail } from 'lucide-react';
import Link from 'next/link';

export default async function TemplatesPage() {
    const supabase = await createClient();

    const { data: templates, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Email Templates</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage reusable email templates for invoices, shipments, and campaigns
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Template
                </Button>
            </div>

            {error && (
                <div className="p-4 border border-red-500 bg-red-500/10 rounded-lg">
                    <p className="text-red-500">Failed to load templates: {error.message}</p>
                </div>
            )}

            {!templates || templates.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Create your first email template to get started
                        </p>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Template
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <Card key={template.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <FileText className="h-8 w-8 text-violet-500" />
                                    <Badge variant={template.active ? 'default' : 'secondary'}>
                                        {template.active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4">{template.name}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {template.subject}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {template.category && (
                                    <Badge variant="outline" className="mb-3">
                                        {template.category}
                                    </Badge>
                                )}

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    {template.variables && Array.isArray(template.variables) && template.variables.length > 0 && (
                                        <div>
                                            <span className="font-medium">Variables:</span>{' '}
                                            {template.variables.join(', ')}
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium">Created:</span>{' '}
                                        {new Date(template.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1">
                                        Preview
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

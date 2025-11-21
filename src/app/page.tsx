import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Purrify CRM
          </h1>
          <p className="text-muted-foreground text-lg">
            Customer Relationship Management for B2B Pet Store Sales
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge variant="secondary">Phase 1: Foundation</Badge>
            <Badge className="bg-primary">Dark Mode</Badge>
            <Badge className="bg-accent">Ready for Setup</Badge>
          </div>
        </div>

        {/* Setup Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Next Steps: Configure Supabase</CardTitle>
            <CardDescription>
              Your CRM is ready! Follow these 3 steps to get started:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Create Supabase Project</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to{" "}
                    <a
                      href="https://app.supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      app.supabase.com
                    </a>{" "}
                    and create a new project named &quot;purrify-crm&quot;
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Run Database Schema</h3>
                  <p className="text-sm text-muted-foreground">
                    In Supabase SQL Editor, run the{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">supabase-schema.sql</code> file
                    from your project root
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Add Environment Variables</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Create <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> in your
                    project root:
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    {`NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                📖 Detailed instructions:{" "}
                <code className="bg-muted px-1 py-0.5 rounded">SETUP.md</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle>✨ What&apos;s Built (Phase 1 Foundation)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Next.js 14 with App Router &amp; TypeScript</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Purrify dark theme (purple/violet primary, teal accents)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>shadcn/ui component library (20+ components)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Complete database schema (13 tables, indexes, RLS ready)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">✓</span>
                <span>Supabase client configuration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">⏳</span>
                <span className="text-muted-foreground">
                  Customer list, detail pages, CSV import (next in Phase 1)
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Purrify CRM © 2025 | Built with Next.js, Supabase, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}

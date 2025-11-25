'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  Building,
  FileText,
  Package,
  Banknote,
  Mail,
  Truck,
  Download,
  Upload,
  Eye,
  Plus,
  Edit,
  Trash2,
  Settings,
  Activity,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useActivityLog, ActivityLog, ActivityCategory } from '@/hooks/use-activity-log';
import Link from 'next/link';

interface ActivityFeedProps {
  limit?: number;
  entityType?: string;
  entityId?: string;
  userId?: string;
  showTitle?: boolean;
  compact?: boolean;
}

const categoryIcons: Record<ActivityCategory, any> = {
  auth: User,
  customer: Building,
  deal: Banknote,
  invoice: FileText,
  product: Package,
  task: Settings,
  email: Mail,
  shipment: Truck,
  export: Download,
  import: Upload,
  system: Settings
};

const actionIcons: Record<string, any> = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  viewed: Eye,
  exported: Download,
  imported: Upload,
  login: User,
  logout: User
};

const categoryColors: Record<ActivityCategory, string> = {
  auth: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  customer: 'bg-green-500/10 text-green-700 dark:text-green-300', 
  deal: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  invoice: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
  product: 'bg-pink-500/10 text-pink-700 dark:text-pink-300',
  task: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
  email: 'bg-red-500/10 text-red-700 dark:text-red-300',
  shipment: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  export: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  import: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  system: 'bg-slate-500/10 text-slate-700 dark:text-slate-300'
};

export function ActivityFeed({
  limit = 50,
  entityType,
  entityId,
  userId,
  showTitle = true,
  compact = false
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { getRecentActivities, getUserActivities, getEntityActivities } = useActivityLog();

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        let data: ActivityLog[] = [];

        if (entityType && entityId) {
          data = await getEntityActivities(entityType, entityId, limit);
        } else if (userId) {
          data = await getUserActivities(userId, limit);
        } else {
          data = await getRecentActivities(limit);
        }

        setActivities(data);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit, entityType, entityId, userId, getRecentActivities, getUserActivities, getEntityActivities]);

  const getActionIcon = (action: string) => {
    const actionType = action.split('_').pop() || '';
    return actionIcons[actionType] || Activity;
  };

  if (loading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading activities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Feed
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">No activities found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
            <Badge variant="secondary" className="ml-auto">
              {activities.length}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? 'p-3' : undefined}>
        <ScrollArea className={compact ? "h-64" : "h-96"}>
          <div className="space-y-3">
            {activities.map((activity) => {
              const CategoryIcon = categoryIcons[activity.category];
              const ActionIcon = getActionIcon(activity.action);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${categoryColors[activity.category]}`}>
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ActionIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {activity.action_display}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-1.5 py-0.5 ${categoryColors[activity.category]}`}
                      >
                        {activity.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {activity.entity_name && (
                        <>
                          <strong>{activity.entity_name}</strong>
                          {activity.entity_url && (
                            <Link 
                              href={activity.entity_url}
                              className="ml-1 inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </>
                      )}
                      {activity.user_email && (
                        <span className="block text-xs">
                          by {activity.user_email}
                        </span>
                      )}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Details
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {activities.length >= limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Load More Activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
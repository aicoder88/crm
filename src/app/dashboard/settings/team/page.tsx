import { TeamList } from '@/components/settings/team-list';
import { InviteUserDialog } from '@/components/settings/invite-user-dialog';
import { Separator } from '@/components/ui/separator';

export default function SettingsTeamPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Team Members</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage who has access to your workspace.
                    </p>
                </div>
                <InviteUserDialog />
            </div>
            <Separator />
            <TeamList />
        </div>
    );
}

'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-user';

export function TeamList() {
    const { user, loading } = useUser();

    if (loading) {
        return <div>Loading team...</div>;
    }

    // Mock team data with current user
    const team = [
        {
            id: user?.id,
            name: user?.user_metadata?.full_name || 'You',
            email: user?.email,
            role: 'Owner',
            status: 'Active',
            avatar: user?.user_metadata?.avatar_url,
        },
        // Add a mock member for demonstration
        {
            id: 'mock-1',
            name: 'Alice Smith',
            email: 'alice@example.com',
            role: 'Member',
            status: 'Active',
            avatar: null,
        },
    ];

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {team.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                    <AvatarFallback>
                                        {member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-medium">{member.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {member.email}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{member.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

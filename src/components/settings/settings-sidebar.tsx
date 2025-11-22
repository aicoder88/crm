'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Users, Building } from 'lucide-react';

const items = [
    {
        title: 'Profile',
        href: '/dashboard/settings/profile',
        icon: User,
    },
    {
        title: 'Team',
        href: '/dashboard/settings/team',
        icon: Users,
    },
    {
        title: 'General',
        href: '/dashboard/settings/general',
        icon: Building,
    },
];

export function SettingsSidebar() {
    const pathname = usePathname();

    return (
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'justify-start hover:bg-muted flex items-center rounded-md px-3 py-2 text-sm font-medium',
                        pathname === item.href
                            ? 'bg-muted hover:bg-muted'
                            : 'hover:bg-transparent hover:underline',
                        'transition-colors'
                    )}
                >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                </Link>
            ))}
        </nav>
    );
}

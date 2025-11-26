'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';

const profileFormSchema = z.object({
    fullName: z.string().min(2, {
        message: 'Name must be at least 2 characters.',
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm() {
    const { user, updateProfile, loading } = useUser();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: '',
            email: '',
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (user) {
            form.reset({
                fullName: user.user_metadata?.full_name || '',
                email: user.email || '',
            });
        }
    }, [user, form]);

    async function onSubmit(data: ProfileFormValues) {
        try {
            // Update email if changed (this might trigger confirmation email)
            if (data.email !== user?.email) {
                await updateProfile({ email: data.email });
                toast.success('Email update verification sent.');
            }

            // Update metadata
            await updateProfile({
                data: { full_name: data.fullName },
            });

            toast.success('Profile updated successfully.');
        } catch (error) {
            logger.error('Failed to update profile', error instanceof Error ? error : new Error(String(error)));
            toast.error('Failed to update profile.');
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                                You can manage verified email addresses in your email settings.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Update profile</Button>
            </form>
        </Form>
    );
}

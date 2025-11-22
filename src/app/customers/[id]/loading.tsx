import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>

                    {/* Location */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                    </Card>

                    {/* Tasks */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-20" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>

                    {/* Deals */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-20" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 space-y-6">
                    {/* Details */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

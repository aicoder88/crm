import { Skeleton } from "@/components/ui/skeleton";

export default function DealsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-24" />
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            
            {/* Pipeline stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-6">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                ))}
            </div>
            
            {/* Kanban board loading */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                        
                        <div className="space-y-3">
                            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, j) => (
                                <div key={j} className="bg-white dark:bg-gray-800 border rounded-lg p-3">
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-3 w-20 mb-2" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
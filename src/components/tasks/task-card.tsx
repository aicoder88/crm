import { Task } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Bell, BellOff } from "lucide-react"

interface TaskCardProps {
    task: Task
    onToggle: (id: string, currentStatus: string) => void
}

export function TaskCard({ task, onToggle }: TaskCardProps) {
    const isCompleted = task.status === 'completed'

    return (
        <Card className={cn("mb-2 border-white/5 bg-white/5 hover:bg-white/10 transition-colors", isCompleted && "opacity-60")}>
            <CardContent className="p-3 flex items-start gap-3">
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => onToggle(task.id, task.status)}
                    className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className={cn("font-medium text-sm text-white", isCompleted && "line-through text-muted-foreground")}>
                            {task.title}
                        </span>
                        <Badge variant="outline" className={cn(
                            "text-[10px] h-5 px-1.5 border-none",
                            task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                task.priority === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                                    'bg-blue-500/20 text-blue-300'
                        )}>
                            {task.priority}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(task.due_date), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span className="capitalize">{task.type}</span>
                        {task.reminder_time && (
                            <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    {task.reminder_sent ? (
                                        <BellOff className="h-3 w-3 text-muted-foreground/50" />
                                    ) : (
                                        <Bell className="h-3 w-3 text-primary drop-shadow-[0_0_5px_rgba(120,50,255,0.5)]" />
                                    )}
                                    {format(new Date(task.reminder_time!), "MMM d, h:mm a")}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

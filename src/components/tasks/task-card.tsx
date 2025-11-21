import { Task } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TaskCardProps {
    task: Task
    onToggle: (id: string, currentStatus: string) => void
}

export function TaskCard({ task, onToggle }: TaskCardProps) {
    const isCompleted = task.status === 'completed'

    return (
        <Card className={cn("mb-2", isCompleted && "opacity-60")}>
            <CardContent className="p-3 flex items-start gap-3">
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => onToggle(task.id, task.status)}
                    className="mt-1"
                />
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className={cn("font-medium text-sm", isCompleted && "line-through text-muted-foreground")}>
                            {task.title}
                        </span>
                        <Badge variant={
                            task.priority === 'high' ? 'destructive' :
                                task.priority === 'medium' ? 'default' :
                                    'secondary'
                        } className="text-[10px] h-5 px-1.5">
                            {task.priority}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(task.due_date), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span className="capitalize">{task.type}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

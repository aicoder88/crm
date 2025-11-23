"use client";

import * as React from "react";
import { Bell, Check, X, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const typeIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: X,
};

const typeColors = {
  info: "text-blue-400",
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
};

export function NotificationCenter() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "New Customer Added",
      message: "PetSmart Montreal has been added to your CRM",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
    {
      id: "2",
      type: "info",
      title: "Invoice Sent",
      message: "Invoice #INV-001 has been sent to customer",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: "3",
      type: "warning",
      title: "Follow-up Reminder",
      message: "You have 3 customers to follow up with today",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:scale-110 transition-transform duration-200"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 glass-premium" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-accent/5 transition-colors cursor-pointer group",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex-shrink-0",
                          typeColors[notification.type]
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {formatTime(notification.timestamp)}
                        </p>
                        {notification.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.action!.onClick();
                            }}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

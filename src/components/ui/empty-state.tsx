"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    container: "py-8",
    icon: "h-12 w-12",
    title: "text-lg",
    description: "text-sm",
  },
  md: {
    container: "py-12",
    icon: "h-16 w-16",
    title: "text-xl",
    description: "text-base",
  },
  lg: {
    container: "py-16",
    icon: "h-24 w-24",
    title: "text-2xl",
    description: "text-lg",
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        "animate-fade-in",
        className
      )}
    >
      {Icon && (
        <div className="mb-6 relative">
          <div className="absolute inset-0 blur-2xl opacity-30 bg-primary/50 rounded-full" />
          <Icon
            className={cn(
              sizes.icon,
              "text-muted-foreground relative z-10",
              "animate-scale-in"
            )}
          />
        </div>
      )}
      <h3
        className={cn(
          "font-semibold text-foreground mb-2",
          sizes.title,
          "text-gradient"
        )}
      >
        {title}
      </h3>
      {description && (
        <p className={cn("text-muted-foreground max-w-md mb-6", sizes.description)}>
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          size={size === "lg" ? "lg" : "default"}
          className="animate-slide-in-bottom"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  action,
  className,
}: Omit<EmptyStateProps, "size">) {
  return (
    <div className={cn("glass-premium rounded-lg", className)}>
      <EmptyState
        icon={Icon}
        title={title}
        description={description}
        action={action}
        size="lg"
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle" | "button";
  animate?: boolean;
}

export function Skeleton({
  className,
  variant = "default",
  animate = true,
}: SkeletonProps) {
  const variantClasses = {
    default: "h-4 w-full",
    card: "h-32 w-full rounded-lg",
    text: "h-4 w-3/4",
    circle: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-md",
  };

  return (
    <div
      className={cn(
        "bg-muted/20 rounded",
        animate && "shimmer",
        variantClasses[variant],
        className
      )}
    />
  );
}

export function CustomerCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton variant="button" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 glass-card rounded-lg">
          <Skeleton variant="circle" className="h-10 w-10" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton variant="button" className="w-32" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-6 rounded-lg space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-lg space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton variant="card" className="h-64" />
        </div>
        <div className="glass-card p-6 rounded-lg space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton variant="card" className="h-64" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-6 rounded-lg space-y-4">
        <Skeleton className="h-6 w-40" />
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6 page-transition">
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
      <div className="flex gap-3">
        <Skeleton variant="button" className="w-24" />
        <Skeleton variant="button" className="w-24" />
      </div>
    </div>
  );
}

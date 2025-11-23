"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  spacing?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "glass" | "premium";
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

const spacingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const variantClasses = {
  default: "bg-card",
  glass: "glass-card",
  premium: "glass-premium",
};

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "full",
  spacing = "md",
  variant = "default",
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        maxWidthClasses[maxWidth],
        spacingClasses[spacing],
        variantClasses[variant],
        "overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "sm" | "md" | "lg" | "xl";
}

const gapClasses = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = "md",
}: ResponsiveGridProps) {
  const gridCols = `grid-cols-${cols.default || 1}`;
  const gridColsSm = cols.sm ? `sm:grid-cols-${cols.sm}` : "";
  const gridColsMd = cols.md ? `md:grid-cols-${cols.md}` : "";
  const gridColsLg = cols.lg ? `lg:grid-cols-${cols.lg}` : "";
  const gridColsXl = cols.xl ? `xl:grid-cols-${cols.xl}` : "";

  return (
    <div
      className={cn(
        "grid",
        gridCols,
        gridColsSm,
        gridColsMd,
        gridColsLg,
        gridColsXl,
        gapClasses[gap],
        "w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StackProps {
  children: React.ReactNode;
  className?: string;
  direction?: "vertical" | "horizontal";
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

export function Stack({
  children,
  className,
  direction = "vertical",
  gap = "md",
  align = "stretch",
  justify = "start",
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}

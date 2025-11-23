"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
} as const;

export function PageWrapper({
  children,
  className,
  animate = true,
  maxWidth = "full",
}: PageWrapperProps) {
  if (!animate) {
    return (
      <div className={cn("w-full mx-auto", maxWidthClasses[maxWidth], className)}>
        {children}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className={cn("w-full mx-auto", maxWidthClasses[maxWidth], className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
        "animate-slide-in-top",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gradient">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 animate-scale-in">{actions}</div>
      )}
    </div>
  );
}

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "premium";
  spacing?: "none" | "sm" | "md" | "lg";
}

const spacingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const variantClasses = {
  default: "",
  glass: "glass-card",
  premium: "glass-premium",
};

export function PageSection({
  children,
  className,
  variant = "default",
  spacing = "md",
}: PageSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg",
        variantClasses[variant],
        spacingClasses[spacing],
        "animate-fade-in",
        className
      )}
    >
      {children}
    </section>
  );
}

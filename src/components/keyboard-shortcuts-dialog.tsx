"use client";

import * as React from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useShortcutsHelp } from "@/hooks/use-keyboard-shortcuts";

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = React.useState(false);
  const { shortcuts } = useShortcutsHelp();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full glass-premium shadow-lg hover:scale-110 transition-all duration-200"
          title="Keyboard Shortcuts (Shift + ?)"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-premium max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient">
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Navigation
            </h4>
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg glass-card hover:glass-hover transition-all"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <kbd className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 font-mono text-xs font-semibold text-primary">
                    {shortcut.formatted}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              General
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg glass-card hover:glass-hover transition-all">
                <span className="text-sm">Open Command Palette</span>
                <kbd className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 font-mono text-xs font-semibold text-primary">
                  ⌘ + K
                </kbd>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg glass-card hover:glass-hover transition-all">
                <span className="text-sm">Show Keyboard Shortcuts</span>
                <kbd className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 font-mono text-xs font-semibold text-primary">
                  Shift + ?
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

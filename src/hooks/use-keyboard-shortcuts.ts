"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: ShortcutConfig[] = [
    {
      key: "d",
      metaKey: true,
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
    },
    {
      key: "c",
      metaKey: true,
      shiftKey: true,
      action: () => router.push("/dashboard/customers"),
      description: "Go to Customers",
    },
    {
      key: "n",
      metaKey: true,
      action: () => router.push("/dashboard/customers/new"),
      description: "New Customer",
    },
    {
      key: "i",
      metaKey: true,
      action: () => router.push("/invoices"),
      description: "Go to Invoices",
    },
    {
      key: "p",
      metaKey: true,
      action: () => router.push("/deals"),
      description: "Go to Pipeline",
    },
    {
      key: ",",
      metaKey: true,
      action: () => router.push("/dashboard/settings"),
      description: "Open Settings",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const metaOrCtrl = shortcut.metaKey
          ? event.metaKey || event.ctrlKey
          : true;
        const shift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const ctrl = shortcut.ctrlKey ? event.ctrlKey : true;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          metaOrCtrl &&
          shift &&
          ctrl
        ) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  return { shortcuts };
}

// Hook for displaying shortcuts in a help dialog
export function useShortcutsHelp() {
  const { shortcuts } = useKeyboardShortcuts();

  const formatShortcut = (shortcut: ShortcutConfig) => {
    const keys: string[] = [];
    if (shortcut.metaKey) keys.push("⌘");
    if (shortcut.ctrlKey) keys.push("Ctrl");
    if (shortcut.shiftKey) keys.push("⇧");
    keys.push(shortcut.key.toUpperCase());
    return keys.join(" + ");
  };

  return {
    shortcuts: shortcuts.map((s) => ({
      ...s,
      formatted: formatShortcut(s),
    })),
  };
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Users,
  Building2,
  DollarSign,
  FileText,
  Package,
  TrendingUp,
  Mail,
  Settings,
  Plus,
  Search,
  Calendar,
  Phone,
  CheckSquare,
  Tag,
  Truck,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-dashboard",
      label: "Dashboard",
      icon: <TrendingUp className="mr-2 h-4 w-4" />,
      action: () => router.push("/dashboard"),
      keywords: ["home", "overview", "analytics"],
    },
    {
      id: "nav-customers",
      label: "Customers",
      icon: <Users className="mr-2 h-4 w-4" />,
      action: () => router.push("/dashboard/customers"),
      keywords: ["clients", "contacts", "accounts"],
    },
    {
      id: "nav-deals",
      label: "Deals & Pipeline",
      icon: <Building2 className="mr-2 h-4 w-4" />,
      action: () => router.push("/deals"),
      keywords: ["sales", "pipeline", "opportunities"],
    },
    {
      id: "nav-invoices",
      label: "Invoices",
      icon: <FileText className="mr-2 h-4 w-4" />,
      action: () => router.push("/invoices"),
      keywords: ["billing", "payments", "finance"],
    },
    {
      id: "nav-products",
      label: "Products",
      icon: <Package className="mr-2 h-4 w-4" />,
      action: () => router.push("/products"),
      keywords: ["catalog", "inventory", "items"],
    },
    {
      id: "nav-shipments",
      label: "Shipments",
      icon: <Truck className="mr-2 h-4 w-4" />,
      action: () => router.push("/shipments"),
      keywords: ["shipping", "tracking", "delivery"],
    },
    {
      id: "nav-campaigns",
      label: "Email Campaigns",
      icon: <Mail className="mr-2 h-4 w-4" />,
      action: () => router.push("/campaigns"),
      keywords: ["email", "marketing", "outreach"],
    },
    {
      id: "nav-settings",
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      action: () => router.push("/dashboard/settings"),
      keywords: ["preferences", "configuration", "profile"],
    },

    // Quick Actions
    {
      id: "action-new-customer",
      label: "New Customer",
      icon: <Plus className="mr-2 h-4 w-4" />,
      action: () => router.push("/dashboard/customers/new"),
      keywords: ["create", "add", "client"],
    },
    {
      id: "action-import",
      label: "Import Data",
      icon: <FileText className="mr-2 h-4 w-4" />,
      action: () => router.push("/dashboard/import"),
      keywords: ["upload", "csv", "bulk"],
    },
  ];

  const runCommand = (command: CommandItem) => {
    setOpen(false);
    command.action();
  };

  return (
    <>
      {/* Keyboard Hint */}
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md border border-border/40 hover:border-border hover:bg-accent/50"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {commands.slice(0, 8).map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command)}
                className="cursor-pointer"
              >
                {command.icon}
                {command.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            {commands.slice(8).map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command)}
                className="cursor-pointer"
              >
                {command.icon}
                {command.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

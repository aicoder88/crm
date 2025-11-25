'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Building, Package, FileText, Banknote, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSearchWithDebounce } from '@/hooks/use-search-query';
import type { SearchResult } from '@/hooks/use-search-query';
import { useRouter } from 'next/navigation';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const entityIcons = {
  customer: Building,
  deal: Banknote,
  product: Package,
  invoice: FileText,
} as const;

const entityColors = {
  customer: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  deal: 'bg-green-500/10 text-green-700 dark:text-green-300',
  product: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  invoice: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
} as const;

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { query, setQuery, searches, isSearching } = useSearchWithDebounce('', 300);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get results from global search
  const results = searches.global.data || [];
  
  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSelect = (result: SearchResult) => {
    // Navigate to the appropriate page based on entity type
    switch (result.entity_type) {
      case 'customer':
        router.push(`/customers/${result.entity_id}`);
        break;
      case 'deal':
        router.push(`/deals/${result.entity_id}`);
        break;
      case 'product':
        router.push(`/products/${result.entity_id}`);
        break;
      case 'invoice':
        router.push(`/invoices/${result.entity_id}`);
        break;
    }
    onOpenChange(false);
    setQuery('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onOpenChange(false);
        setQuery('');
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
          </DialogTitle>
        </DialogHeader>

        <div className="px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search customers, deals, products, invoices..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10"
              autoComplete="off"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {searches.global.isError && (
            <div className="px-6 py-4 text-sm text-red-600">
              Error: {searches.global.error?.message}
            </div>
          )}

          {!isSearching && !searches.global.isError && query && results.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => {
                const Icon = entityIcons[result.entity_type];
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={`${result.entity_type}-${result.entity_id}`}
                    onClick={() => handleSelect(result)}
                    className={`w-full px-6 py-3 text-left hover:bg-muted/50 flex items-center gap-3 ${
                      isSelected ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {result.title}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-1.5 py-0.5 ${entityColors[result.entity_type]}`}
                        >
                          {result.entity_type}
                        </Badge>
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {Math.round(result.rank * 100)}% match
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!query && (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>Start typing to search across all your data</p>
              <p className="text-xs mt-2 opacity-60">
                Use arrow keys to navigate, Enter to select, ESC to close
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
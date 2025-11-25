'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
    searchParams?: URLSearchParams;
}

export function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
    // Helper function to create pagination URLs
    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        return `${basePath}?${params.toString()}`;
    };

    // Generate pagination range
    const getPageNumbers = () => {
        const delta = 2;
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);
        const pages: (number | string)[] = [];

        // Add first page if not in range
        if (left > 1) {
            pages.push(1);
            if (left > 2) {
                pages.push('...');
            }
        }

        // Add visible pages
        for (let i = left; i <= right; i++) {
            pages.push(i);
        }

        // Add last page if not in range
        if (right < totalPages) {
            if (right < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center gap-1">
            {/* Previous button */}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                asChild={currentPage > 1}
                className="h-8 px-3"
            >
                {currentPage > 1 ? (
                    <Link href={createPageUrl(currentPage - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                    </Link>
                ) : (
                    <>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                    </>
                )}
            </Button>

            {/* Page numbers */}
            {pageNumbers.map((page, index) => (
                <div key={index}>
                    {page === '...' ? (
                        <div className="flex h-8 w-8 items-center justify-center">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </div>
                    ) : (
                        <Button
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                                'h-8 w-8',
                                currentPage === page && 'bg-primary text-primary-foreground'
                            )}
                            asChild={currentPage !== page}
                        >
                            {currentPage === page ? (
                                <span>{page}</span>
                            ) : (
                                <Link href={createPageUrl(page as number)}>
                                    {page}
                                </Link>
                            )}
                        </Button>
                    )}
                </div>
            ))}

            {/* Next button */}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                asChild={currentPage < totalPages}
                className="h-8 px-3"
            >
                {currentPage < totalPages ? (
                    <Link href={createPageUrl(currentPage + 1)}>
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next page</span>
                    </Link>
                ) : (
                    <>
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next page</span>
                    </>
                )}
            </Button>
        </nav>
    );
}
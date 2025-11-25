'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { toast } from 'sonner';
import {
    exportToCSV,
    exportToJSON,
    exportToExcel,
    ExportColumn,
    ExportOptions
} from '@/lib/export-utils';
import { useActivityLog } from '@/hooks/use-activity-log';

export type ExportFormat = 'csv' | 'json' | 'excel';

interface ExportButtonProps<T> {
    data: T[];
    columns?: ExportColumn<T>[];
    filename?: string;
    disabled?: boolean;
    formats?: ExportFormat[];
    size?: 'default' | 'sm' | 'lg';
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
    showText?: boolean;
    entityType?: string;
    onExport?: (format: ExportFormat, count: number) => void;
}

export function ExportButton<T extends Record<string, any>>({
    data,
    columns,
    filename = 'export',
    disabled = false,
    formats = ['csv', 'json', 'excel'],
    size = 'default',
    variant = 'outline',
    showText = true,
    entityType,
    onExport,
}: ExportButtonProps<T>) {
    const [isExporting, setIsExporting] = useState(false);
    const { logExportAction } = useActivityLog();

    const handleExport = async (format: ExportFormat) => {
        if (!data || data.length === 0) {
            toast.error('No data to export');
            return;
        }

        setIsExporting(true);
        
        try {
            const options: ExportOptions = { filename };

            switch (format) {
                case 'csv':
                    if (!columns) {
                        throw new Error('Columns must be specified for CSV export');
                    }
                    exportToCSV(data, columns, options);
                    break;
                case 'json':
                    exportToJSON(data, options);
                    break;
                case 'excel':
                    if (!columns) {
                        throw new Error('Columns must be specified for Excel export');
                    }
                    exportToExcel(data, columns, options);
                    break;
            }

            toast.success(`Exported ${data.length} records as ${format.toUpperCase()}`);
            
            // Log the export activity
            if (entityType) {
                await logExportAction(entityType, format.toUpperCase(), data.length);
            }
            
            onExport?.(format, data.length);
            
        } catch (error) {
            console.error('Export error:', error);
            toast.error(error instanceof Error ? error.message : 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    // Single format - render as button
    if (formats.length === 1) {
        const format = formats[0];
        const formatConfig = getFormatConfig(format);
        
        return (
            <Button
                variant={variant}
                size={size}
                disabled={disabled || isExporting || data.length === 0}
                onClick={() => handleExport(format)}
                className="gap-2"
            >
                <formatConfig.icon className="h-4 w-4" />
                {showText && (isExporting ? 'Exporting...' : `Export ${formatConfig.label}`)}
            </Button>
        );
    }

    // Multiple formats - render as dropdown
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    disabled={disabled || isExporting || data.length === 0}
                    className="gap-2"
                >
                    <Download className="h-4 w-4" />
                    {showText && (isExporting ? 'Exporting...' : 'Export')}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {formats.map((format) => {
                    const config = getFormatConfig(format);
                    return (
                        <DropdownMenuItem
                            key={format}
                            onClick={() => handleExport(format)}
                            className="gap-2"
                        >
                            <config.icon className="h-4 w-4" />
                            <span>Export as {config.label}</span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function getFormatConfig(format: ExportFormat) {
    switch (format) {
        case 'csv':
            return {
                label: 'CSV',
                icon: FileSpreadsheet,
                description: 'Comma-separated values'
            };
        case 'json':
            return {
                label: 'JSON',
                icon: FileText,
                description: 'JavaScript Object Notation'
            };
        case 'excel':
            return {
                label: 'Excel',
                icon: File,
                description: 'Excel spreadsheet'
            };
    }
}
// Utility functions for data export functionality

export interface ExportColumn<T> {
    key: keyof T;
    header: string;
    formatter?: (value: T[keyof T]) => string;
}

export interface ExportOptions {
    filename?: string;
    includeTimestamp?: boolean;
    dateFormat?: 'iso' | 'local' | 'short';
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    columns: ExportColumn<T>[],
    options: ExportOptions = {}
): void {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    const {
        filename = 'export',
        includeTimestamp = true,
        dateFormat = 'local'
    } = options;

    // Generate CSV header
    const headers = columns.map(col => `"${col.header}"`).join(',');

    // Generate CSV rows
    const rows = data.map(row => {
        return columns.map(col => {
            let value: unknown = row[col.key];

            // Apply formatter if provided
            if (col.formatter) {
                value = col.formatter(value);
            } else {
                // Default formatting
                value = formatCellValue(value, dateFormat);
            }

            // Escape quotes and wrap in quotes
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',');
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n');

    // Create and download file
    const finalFilename = includeTimestamp
        ? `${filename}_${new Date().toISOString().split('T')[0]}.csv`
        : `${filename}.csv`;

    downloadFile(csvContent, finalFilename, 'text/csv');
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(
    data: T[],
    options: ExportOptions = {}
): void {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    const {
        filename = 'export',
        includeTimestamp = true
    } = options;

    const jsonContent = JSON.stringify(data, null, 2);

    const finalFilename = includeTimestamp
        ? `${filename}_${new Date().toISOString().split('T')[0]}.json`
        : `${filename}.json`;

    downloadFile(jsonContent, finalFilename, 'application/json');
}

/**
 * Export data to Excel format (XLSX)
 */
export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    columns: ExportColumn<T>[],
    options: ExportOptions = {}
): void {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // For now, export as CSV which Excel can open
    // TODO: Implement proper XLSX export with a library like xlsx or exceljs
    exportToCSV(data, columns, { ...options, filename: options.filename || 'excel_export' });
}

/**
 * Format cell value based on its type
 */
function formatCellValue(value: unknown, dateFormat: 'iso' | 'local' | 'short'): string {
    if (value === null || value === undefined) {
        return '';
    }

    // Handle dates
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        const date = value instanceof Date ? value : new Date(value);

        switch (dateFormat) {
            case 'iso':
                return date.toISOString();
            case 'local':
                return date.toLocaleString();
            case 'short':
                return date.toLocaleDateString();
            default:
                return date.toLocaleString();
        }
    }

    // Handle arrays
    if (Array.isArray(value)) {
        return value.join('; ');
    }

    // Handle objects
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }

    return String(value);
}

/**
 * Download file to user's device
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
}

// Predefined column configurations for common entities

export const customerExportColumns: ExportColumn<Record<string, unknown>>[] = [
    { key: 'store_name', header: 'Store Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'city', header: 'City' },
    { key: 'province', header: 'Province' },
    { key: 'postal_code', header: 'Postal Code' },
    { key: 'status', header: 'Status' },
    { key: 'type', header: 'Type' },
    {
        key: 'created_at',
        header: 'Created Date',
        formatter: (date) => new Date(date).toLocaleDateString()
    }
];

export const dealExportColumns: ExportColumn<Record<string, unknown>>[] = [
    { key: 'title', header: 'Deal Title' },
    { key: 'customer', header: 'Customer', formatter: (customer) => customer?.store_name || '' },
    { key: 'value', header: 'Value', formatter: (value) => `$${Number(value).toFixed(2)}` },
    { key: 'stage', header: 'Stage' },
    { key: 'probability', header: 'Probability (%)', formatter: (prob) => `${prob}%` },
    {
        key: 'expected_close_date',
        header: 'Expected Close Date',
        formatter: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
    {
        key: 'created_at',
        header: 'Created Date',
        formatter: (date) => new Date(date).toLocaleDateString()
    }
];

export const invoiceExportColumns: ExportColumn<Record<string, unknown>>[] = [
    { key: 'invoice_number', header: 'Invoice Number' },
    { key: 'customer', header: 'Customer', formatter: (customer) => customer?.store_name || '' },
    { key: 'total', header: 'Total', formatter: (total) => `$${Number(total).toFixed(2)}` },
    { key: 'status', header: 'Status' },
    {
        key: 'due_date',
        header: 'Due Date',
        formatter: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
    {
        key: 'created_at',
        header: 'Created Date',
        formatter: (date) => new Date(date).toLocaleDateString()
    }
];

export const productExportColumns: ExportColumn<Record<string, unknown>>[] = [
    { key: 'sku', header: 'SKU' },
    { key: 'name', header: 'Product Name' },
    { key: 'description', header: 'Description' },
    { key: 'unit_price', header: 'Unit Price', formatter: (price) => `$${Number(price).toFixed(2)}` },
    { key: 'currency', header: 'Currency' },
    { key: 'active', header: 'Active', formatter: (active) => active ? 'Yes' : 'No' },
    {
        key: 'created_at',
        header: 'Created Date',
        formatter: (date) => new Date(date).toLocaleDateString()
    }
];

// Convenience functions for specific entity exports
export const exportCustomers = (data: Record<string, unknown>[], options?: ExportOptions) =>
    exportToCSV(data, customerExportColumns, { filename: 'customers', ...options });

export const exportDeals = (data: Record<string, unknown>[], options?: ExportOptions) =>
    exportToCSV(data, dealExportColumns, { filename: 'deals', ...options });

export const exportInvoices = (data: Record<string, unknown>[], options?: ExportOptions) =>
    exportToCSV(data, invoiceExportColumns, { filename: 'invoices', ...options });

export const exportProducts = (data: Record<string, unknown>[], options?: ExportOptions) =>
    exportToCSV(data, productExportColumns, { filename: 'products', ...options });
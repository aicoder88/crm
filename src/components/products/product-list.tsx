'use client';

import { useProducts } from '@/hooks/use-products';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/invoice-utils';
import { Pencil, Trash2 } from 'lucide-react';
import { ProductDialog } from './product-dialog';

export function ProductList() {
    const { products, loading, deleteProduct, refresh } = useProducts();

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await deleteProduct(id);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    if (loading) {
        return <div className="py-8 text-center text-muted-foreground">Loading products...</div>;
    }

    if (products.length === 0) {
        return (
            <div className="py-8 text-center text-muted-foreground">
                No products found. Add your first product to get started.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">
                                {product.description || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatCurrency(product.unit_price, product.currency)}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <ProductDialog
                                        product={product}
                                        trigger={
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        }
                                        onSuccess={refresh}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

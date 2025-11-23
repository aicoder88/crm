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
        <div className="rounded-xl border border-white/5 glass overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="text-muted-foreground">SKU</TableHead>
                        <TableHead className="text-muted-foreground">Name</TableHead>
                        <TableHead className="text-muted-foreground">Description</TableHead>
                        <TableHead className="text-right text-muted-foreground">Price</TableHead>
                        <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id} className="hover:bg-white/5 border-white/5 transition-colors">
                            <TableCell className="font-mono text-sm text-white">{product.sku}</TableCell>
                            <TableCell className="font-medium text-white">{product.name}</TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">
                                {product.description || '-'}
                            </TableCell>
                            <TableCell className="text-right text-white">
                                {formatCurrency(product.unit_price, product.currency)}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <ProductDialog
                                        product={product}
                                        trigger={
                                            <Button variant="ghost" size="icon" className="hover:bg-white/10 hover:text-white text-muted-foreground transition-colors">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        }
                                        onSuccess={refresh}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(product.id)}
                                        className="hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
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

import { ProductList } from '@/components/products/product-list';
import { ProductDialog } from '@/components/products/product-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function ProductsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage your product catalog</p>
                </div>
                <ProductDialog
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    }
                />
            </div>

            <ProductList />
        </div>
    );
}

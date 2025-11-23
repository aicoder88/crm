import { ProductList } from '@/components/products/product-list';
import { ProductDialog } from '@/components/products/product-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function ProductsPage() {
    return (
        <div className="space-y-6 animate-fade-in-down">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Products</h1>
                    <p className="text-muted-foreground mt-1">Manage your product catalog</p>
                </div>
                <ProductDialog
                    trigger={
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(120,50,255,0.5)] hover:shadow-[0_0_25px_rgba(120,50,255,0.7)] transition-all border-none">
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

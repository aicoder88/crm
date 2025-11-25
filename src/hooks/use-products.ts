'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClient();

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('active', true)
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([product])
                .select()
                .single();

            if (error) throw error;
            await fetchProducts();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async function updateProduct(id: string, updates: Partial<Product>) {
        try {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            await fetchProducts();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async function deleteProduct(id: string) {
        try {
            // Soft delete - set active to false
            const { error } = await supabase
                .from('products')
                .update({ active: false })
                .eq('id', id);

            if (error) throw error;
            await fetchProducts();
        } catch (err) {
            throw err;
        }
    }

    return {
        products,
        loading,
        error,
        createProduct,
        updateProduct,
        deleteProduct,
        refresh: fetchProducts,
    };
}

export function useProduct(id: string | null) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClient();

    const fetchProduct = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [id, supabase]);

    useEffect(() => {
        if (!id) {
            setProduct(null);
            setLoading(false);
            return;
        }

        fetchProduct();
    }, [id, fetchProduct]);

    return { product, loading, error, refresh: fetchProduct };
}

// Custom hook for browsing the catalog with an optional category filter.
import { useState } from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from './productsApi';

// Returns products for the selected category, the category list, and a filter setter.
export function useProducts() {
  const [categorySlug, setCategorySlug] = useState<string | undefined>(undefined);
  const productsQuery = useGetProductsQuery(categorySlug);
  const categoriesQuery = useGetCategoriesQuery();

  return {
    products: productsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    categorySlug,
    setCategorySlug,
  };
}

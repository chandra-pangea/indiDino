// RTK Query endpoints for the product catalog and categories.
import { baseApi } from '../../api/baseApi';
import type { Product, ProductCategory } from '../../types';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /products?category=slug — list products, optionally filtered by category.
    getProducts: builder.query<Product[], string | undefined>({
      query: (categorySlug) => (categorySlug ? `/products?category=${categorySlug}` : '/products'),
    }),
    // GET /product-categories — list all categories.
    getCategories: builder.query<ProductCategory[], void>({
      query: () => '/product-categories',
    }),
  }),
});

export const { useGetProductsQuery, useGetCategoriesQuery } = productsApi;

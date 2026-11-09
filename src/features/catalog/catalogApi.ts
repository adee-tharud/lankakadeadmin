import { adminApi } from '../../shared/api/adminApi'
import { request } from '../../shared/api/request'
import type {
  AdminCategory, AdminProduct, AdminProductDetail, Category, CategoryInput, ProductInput,
  PublicProduct, PublicProductDetail, VariantChanges, VariantInput,
} from './catalogTypes'

type Page = { nextCursor: string | null }
type CategoryPage = Page & { categories: AdminCategory[] }
type ProductPage = Page & { products: AdminProduct[] }
type PublicProductPage = Page & { products: PublicProduct[] }
type ListQuery = { after?: string; q?: string }
type ProductEntry = { productId: string; variantId?: string }

function productEntryPath({ productId, variantId }: ProductEntry) {
  const path = `/admin/products/${encodeURIComponent(productId)}`
  return variantId ? `${path}/variants/${encodeURIComponent(variantId)}` : path
}

function pagePath(path: string, { after, q }: ListQuery) {
  const params = new URLSearchParams()
  if (after) params.set('after', after)
  if (q) params.set('q', q)
  return params.size ? `${path}?${params}` : path
}

export async function saveProduct(id: string | undefined, details: Partial<ProductInput>, image: File | null, altText: string) {
  let body: Partial<ProductInput> | FormData = details
  if (image) {
    body = new FormData()
    body.set('product', JSON.stringify(details))
    body.set('image', image)
    body.set('altText', altText)
  }
  return request({
    path: id ? `/admin/products/${encodeURIComponent(id)}` : '/admin/products',
    method: id ? 'PATCH' : 'POST',
    body,
  })
}

const catalogApi = adminApi.injectEndpoints({
  endpoints: (build) => ({
    categories: build.query<CategoryPage, ListQuery>({
      query: (args) => ({ path: pagePath('/admin/categories', args) }),
      providesTags: ['Catalog'],
    }),
    categoryChoices: build.infiniteQuery<Page & { categories: Category[] }, void, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      },
      query: ({ pageParam }) => ({ path: pagePath('/categories', { after: pageParam }), public: true }),
      providesTags: ['Catalog'],
    }),
    saveCategory: build.mutation<unknown, { id?: string; details: CategoryInput }>({
      query: ({ id, details }) => ({
        path: id ? `/admin/categories/${encodeURIComponent(id)}` : '/admin/categories',
        method: id ? 'PATCH' : 'POST',
        body: details,
      }),
      invalidatesTags: (_result, error) => error ? [] : ['Catalog'],
    }),
    products: build.query<ProductPage, ListQuery>({
      query: (args) => ({ path: pagePath('/admin/products', args) }),
      providesTags: ['Catalog'],
    }),
    product: build.query<{ product: AdminProductDetail }, string>({
      query: (id) => ({ path: `/admin/products/${encodeURIComponent(id)}` }),
      providesTags: ['Catalog'],
    }),
    saveVariant: build.mutation<unknown, { productId: string; details: VariantInput } |
      { productId: string; variantId: string; details: VariantChanges }>({
      query: (args) => {
        const path = `/admin/products/${encodeURIComponent(args.productId)}/variants`
        return 'variantId' in args
          ? { path: `${path}/${encodeURIComponent(args.variantId)}`, method: 'PATCH', body: args.details }
          : { path, method: 'POST', body: args.details }
      },
      invalidatesTags: (_result, error) => error ? [] : ['Catalog'],
    }),
    archiveCatalogEntry: build.mutation<null, { categoryId: string } | ProductEntry>({
      query: (entry) => {
        if ('categoryId' in entry) return { path: `/admin/categories/${encodeURIComponent(entry.categoryId)}`, method: 'DELETE' }
        return { path: productEntryPath(entry), method: 'DELETE' }
      },
      invalidatesTags: (_result, error) => error ? [] : ['Catalog'],
    }),
    restoreProductEntry: build.mutation<null, ProductEntry>({
      query: (entry) => ({ path: `${productEntryPath(entry)}/restore`, method: 'POST' }),
      invalidatesTags: (_result, error) => error ? [] : ['Catalog'],
    }),
    liveProducts: build.query<PublicProductPage, ListQuery>({
      query: (args) => ({ path: pagePath('/products', args), public: true }),
      providesTags: ['Catalog'],
    }),
    liveProduct: build.query<{ product: PublicProductDetail }, string>({
      query: (slug) => ({ path: `/products/${encodeURIComponent(slug)}`, public: true }),
      providesTags: ['Catalog'],
    }),
  }),
})

export const {
  useCategoriesQuery, useCategoryChoicesInfiniteQuery, useSaveCategoryMutation, useProductsQuery, useProductQuery,
  useSaveVariantMutation, useArchiveCatalogEntryMutation, useRestoreProductEntryMutation, useLiveProductsQuery, useLiveProductQuery,
} = catalogApi

export type Category = { id: string; name: string; slug: string; description: string | null }
export type AdminCategory = Category & { archivedAt: string | null }
export type CategoryInput = { name: string; slug: string; description: string | null }

type Product = { id: string; name: string; slug: string; categoryId: string; categorySlug: string }
export type AdminProduct = Product & { archivedAt: string | null }
export type PublicProduct = Product & { priceFrom: string; inStock: boolean }

export type ProductImage = { url: string; altText: string }
export type ProductOption = { id: string; name: string; values: { id: string; name: string }[] }
export type Variant = {
  id: string
  sku: string
  price: string
  availableStock: number
  availability: 'in_stock' | 'sold_out'
  optionValueIds: string[]
}
export type AdminVariant = Variant & {
  archivedAt: string | null
  stockOnHand: number
  stockReserved: number
  lowStockThreshold: number
}
type ProductDetails<V extends Variant> = {
  description: string | null
  images: ProductImage[]
  options: ProductOption[]
  variants: V[]
}
export type AdminProductDetail = AdminProduct & ProductDetails<AdminVariant>
export type PublicProductDetail = Product & ProductDetails<Variant>

export type ProductInput = {
  name: string
  slug: string
  categoryId: string
  description: string | null
  options?: { name: string; values: string[] }[]
}
export type VariantInput = { sku: string; openingStock: number; optionValueIds: string[] } & VariantChanges
export type VariantChanges = { price: string; lowStockThreshold: number }

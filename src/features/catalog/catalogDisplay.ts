import { apiOrigin } from '../../shared/config/env'
import type { ProductOption, Variant } from './catalogTypes'

const ron = new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' })
export const formatPrice = (value: string) => ron.format(Number(value))

export function formatVariantChoices(variant: Variant, options: ProductOption[]) {
  const values = options.flatMap((option) => option.values
    .filter((value) => variant.optionValueIds.includes(value.id))
    .map((value) => `${option.name}: ${value.name}`))
  return values.length ? values.join(' · ') : 'Standard variant'
}

export function productImageUrl(value: string) {
  if (/^\/api\/v1\/product-images\/[0-9a-f-]{36}$/.test(value) && apiOrigin) return new URL(value, apiOrigin).href
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href
  } catch {
    // Invalid legacy URLs are omitted from the preview.
  }
}

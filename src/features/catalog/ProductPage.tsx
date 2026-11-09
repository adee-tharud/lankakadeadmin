import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productsPath } from '../../app/paths'
import type { ApiError } from '../../shared/api/request'
import { Button } from '../../shared/ui/Button'
import { useArchiveCatalogEntryMutation, useProductQuery, useRestoreProductEntryMutation, useSaveVariantMutation } from './catalogApi'
import { formatPrice, formatVariantChoices } from './catalogDisplay'
import type { AdminProductDetail, AdminVariant, VariantChanges } from './catalogTypes'
import {
  CatalogActionButton, CatalogHeader, CatalogImage, CatalogStatus, ErrorMessage, Field,
  Panel, TextField,
} from './CatalogUi'
import { fieldProps, formError, linkClass } from './catalogUiState'
import { ProductForm } from './ProductForm'

const maxStock = 4_294_967_295

function VariantForm({ product, variant, close }: { product: AdminProductDetail; variant?: AdminVariant; close: () => void }) {
  const [save, { isLoading }] = useSaveVariantMutation()
  const [error, setError] = useState<ApiError>()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isLoading) return
    const fields = new FormData(event.currentTarget)
    const details: VariantChanges = {
      price: String(fields.get('price')).trim(),
      lowStockThreshold: Number(fields.get('lowStockThreshold')),
    }
    setError(undefined)
    try {
      if (variant) {
        await save({ productId: product.id, variantId: variant.id, details }).unwrap()
      } else {
        await save({
          productId: product.id,
          details: {
            ...details,
            sku: String(fields.get('sku')).trim(),
            openingStock: Number(fields.get('openingStock')),
            optionValueIds: product.options.map((option) => String(fields.get(`option-${option.id}`))),
          },
        }).unwrap()
      }
      close()
    } catch (failure) {
      setError(formError(failure))
    }
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-xl border border-border bg-canvas p-4">
      <h3 className="mb-3 font-semibold">{variant ? `Edit ${variant.sku}` : 'Add variant'}</h3>
      <fieldset disabled={isLoading} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {!variant && <TextField label="SKU" name="sku" error={error} maxLength={80} required />}
          <TextField label="Price (RON)" name="price" error={error} defaultValue={variant?.price}
            placeholder="12.50" inputMode="decimal" maxLength={13} pattern={'(?:0|[1-9][0-9]{0,9})(?:\\.[0-9]{1,2})?'} required />
          {!variant && <TextField label="Opening stock" name="openingStock" error={error}
            type="number" min={0} max={maxStock} step={1} defaultValue={0} required />}
          <TextField label="Low-stock threshold" name="lowStockThreshold" error={error} type="number"
            min={0} max={maxStock} step={1} defaultValue={variant?.lowStockThreshold ?? 20} required />
          {!variant && product.options.map((option) => (
            <Field key={option.id} label={option.name} name={`option-${option.id}`}>
              <select {...fieldProps(`option-${option.id}`)} defaultValue="" required>
                <option value="" disabled>Choose a value</option>
                {option.values.map((value) => <option key={value.id} value={value.id}>{value.name}</option>)}
              </select>
            </Field>
          ))}
        </div>
        {error && !['sku', 'price', 'openingStock', 'lowStockThreshold'].includes(error.field ?? '') && <ErrorMessage error={error} />}
        <div className="flex flex-wrap gap-4">
          <Button type="submit">{isLoading ? 'Saving…' : 'Save variant'}</Button>
          <Button variant="text" onClick={close}>Cancel</Button>
        </div>
      </fieldset>
    </form>
  )
}

function Variants({ product }: { product: AdminProductDetail }) {
  const [editing, setEditing] = useState<AdminVariant | 'new'>()
  const [archive] = useArchiveCatalogEntryMutation()
  const [restore] = useRestoreProductEntryMutation()
  const active = product.archivedAt === null
  const hasVariants = product.variants.length > 0
  const hasActiveVariant = product.variants.some((variant) => variant.archivedAt === null)
  const canAddVariant = active && (product.options.length > 0 || !hasVariants)

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Variants</h2>
          <p className="mt-1 text-sm text-muted">A product needs an active variant to appear in the storefront catalog.</p>
        </div>
        {canAddVariant && <Button onClick={() => setEditing('new')}>Add variant</Button>}
      </div>
      {active && !hasActiveVariant && (
        <p className="mb-4 rounded-lg bg-canvas px-3 py-2 text-sm text-muted">
          Hidden from Live Catalog because it has no active variants. {hasVariants ? 'Restore a variant below.' : 'Add a variant to make it available.'}
        </p>
      )}
      {active && editing && <VariantForm key={editing === 'new' ? editing : editing.id} product={product}
        variant={editing === 'new' ? undefined : editing} close={() => setEditing(undefined)} />}
      {!product.variants.length && <p className="text-sm text-muted">No variants yet.</p>}
      {!!product.variants.length && (
        <ul className="divide-y divide-border">
          {product.variants.map((variant) => (
            <li key={variant.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="font-semibold wrap-anywhere">{variant.sku}</p>
                <p className="mt-1 text-sm wrap-anywhere text-muted">{formatVariantChoices(variant, product.options)}</p>
                <p className="mt-1 text-sm text-muted">{formatPrice(variant.price)} · {variant.availableStock} available · {variant.stockReserved} reserved</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <CatalogStatus archived={variant.archivedAt !== null} />
                {active && variant.archivedAt === null && (
                  <>
                    <Button variant="text" onClick={() => setEditing(variant)} aria-label={`Edit ${variant.sku}`}>Edit</Button>
                    <CatalogActionButton action="Archive" name={variant.sku}
                      consequence="This variant will disappear from the storefront. A product with no active variants will also be hidden."
                      run={() => archive({ productId: product.id, variantId: variant.id }).unwrap()} />
                  </>
                )}
                {active && variant.archivedAt !== null && (
                  <CatalogActionButton action="Restore" name={variant.sku}
                    consequence="This variant can appear in the storefront if the product’s category is active."
                    run={() => restore({ productId: product.id, variantId: variant.id }).unwrap()} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export function NewProductPage() {
  return (
    <>
      <CatalogHeader title="Add product" description="Add an image and product details, then create its sellable variants." />
      <ProductForm />
    </>
  )
}

export function ProductPage() {
  const { productId = '' } = useParams()
  const validId = /^[1-9][0-9]{0,19}$/.test(productId)
  const { currentData, error, isFetching, refetch } = useProductQuery(productId, { skip: !validId })
  const [archive] = useArchiveCatalogEntryMutation()
  const [restore] = useRestoreProductEntryMutation()
  const product = currentData?.product

  return (
    <>
      <CatalogHeader title={product?.name ?? 'Product details'} description="Manage this product and the variants customers can purchase.">
        <Link to={productsPath} className={linkClass}>Back to products</Link>
      </CatalogHeader>
      <div className="space-y-5">
        {!validId && <p role="alert" className="text-error">This product link is invalid.</p>}
        <ErrorMessage error={error} retry={() => void refetch()} />
        {isFetching && !product && <p role="status" className="text-sm text-muted">Loading product…</p>}
        {product && (
          <>
            {product.archivedAt === null ? (
              <>
                <ProductForm key={product.id} product={product} />
                <Variants key={product.id} product={product} />
                <Panel>
                  <h2 className="mb-3 text-lg font-semibold">Archive product</h2>
                  <CatalogActionButton action="Archive" name={product.name} consequence="The product and its variants will disappear from the storefront."
                    run={() => archive({ productId: product.id }).unwrap()} />
                </Panel>
              </>
            ) : (
              <>
                <Panel>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CatalogStatus archived />
                    <CatalogActionButton action="Restore" name={product.name}
                      consequence="The product will return to the storefront if its category is active and it has an active variant."
                      run={() => restore({ productId: product.id }).unwrap()} />
                  </div>
                  <p className="my-4 text-sm text-muted">{product.description || 'No description.'}</p>
                  <CatalogImage image={product.images[0]} name={product.name} />
                </Panel>
                <Variants key={product.id} product={product} />
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoriesPath, productsPath } from '../../app/paths'
import { useAppDispatch } from '../../app/hooks'
import { adminApi } from '../../shared/api/adminApi'
import type { ApiError } from '../../shared/api/request'
import { Button } from '../../shared/ui/Button'
import { saveProduct, useCategoryChoicesInfiniteQuery } from './catalogApi'
import type { AdminProductDetail, ProductInput } from './catalogTypes'
import {
  CatalogImage, DescriptionField, ErrorMessage, Field, Panel, TextField,
} from './CatalogUi'
import { fieldProps, linkClass } from './catalogUiState'

const acceptedImages = ['image/jpeg', 'image/png', 'image/webp']
const maxImageBytes = 5 * 1024 * 1024

function inputError(field: string, message: string): ApiError {
  return { status: 400, code: 'INVALID_INPUT', field, message }
}

export function ProductForm({ product }: { product?: AdminProductDetail }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const categories = useCategoryChoicesInfiniteQuery()
  const choices = categories.data?.pages.flatMap((page) => page.categories) ?? []
  const [optionKeys, setOptionKeys] = useState<number[]>([])
  const nextKey = useRef(0)
  const pending = useRef(false)
  const imageInput = useRef<HTMLInputElement>(null)
  const [selection, setSelection] = useState<{ image: File; preview: string }>()
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<ApiError>()
  const originalCategoryLoaded = choices.some(({ id }) => id === product?.categoryId)

  useEffect(() => {
    if (selection) return () => URL.revokeObjectURL(selection.preview)
  }, [selection])

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null
    setSaved(false)
    if (file && (file.size === 0 || file.size > maxImageBytes || (file.type && !acceptedImages.includes(file.type)))) {
      event.currentTarget.value = ''
      setSelection(undefined)
      setError(inputError('image', 'Choose a JPEG, PNG, or WebP image up to 5 MiB.'))
      return
    }
    setSelection(file ? { image: file, preview: URL.createObjectURL(file) } : undefined)
    if (error?.field === 'image') setError(undefined)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    setSaved(false)
    setError(undefined)
    if (!product && !selection) {
      setError(inputError('image', 'Choose a product image from your device.'))
      imageInput.current?.focus()
      return
    }

    const fields = new FormData(event.currentTarget)
    const categoryId = String(fields.get('categoryId'))
    const details: Partial<ProductInput> = {
      name: String(fields.get('name')).trim(),
      slug: String(fields.get('slug')).trim(),
      description: String(fields.get('description')).trim() || null,
    }
    if (categoryId !== product?.categoryId) details.categoryId = categoryId
    if (!product && optionKeys.length) {
      const options = optionKeys.map((key) => ({
        name: String(fields.get(`option-${key}`)).trim(),
        values: String(fields.get(`values-${key}`)).split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
      }))
      if (options.some(({ name, values }) => !name || values.length < 1 || values.length > 20 || values.some((value) => value.length > 100))) {
        setError(inputError('options', 'Enter a name and 1 to 20 values per option. Each value can contain up to 100 characters.'))
        return
      }
      details.options = options
    }

    pending.current = true
    setBusy(true)
    try {
      const result = await saveProduct(product?.id, details, selection?.image ?? null, String(fields.get('altText') ?? ''))
      if (result.error) {
        if (result.error.status === 401) dispatch(adminApi.util.invalidateTags(['Session']))
        setError(result.error)
        return
      }

      dispatch(adminApi.util.invalidateTags(['Catalog']))
      if (product) {
        setSelection(undefined)
        if (imageInput.current) imageInput.current.value = ''
        setSaved(true)
        return
      }

      const data = result.data
      if (data && typeof data === 'object' && 'product' in data && data.product && typeof data.product === 'object' &&
          'id' in data.product && typeof data.product.id === 'string' && /^\d+$/.test(data.product.id)) {
        void navigate(`${productsPath}/${data.product.id}`, { replace: true })
      } else {
        setError({ status: 502, code: 'INVALID_RESPONSE', message: 'Check the product list to confirm whether the product was saved.' })
      }
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <Panel>
      <h2 className="mb-4 text-lg font-semibold">Product details</h2>
      <form onSubmit={submit}>
        <fieldset disabled={busy} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" name="name" error={error} defaultValue={product?.name} maxLength={200} required />
            <TextField label="Slug" name="slug" error={error} defaultValue={product?.slug} maxLength={200}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="ceylon-cinnamon" required />
          </div>
          <Field label="Category" name="categoryId" error={error}>
            <select {...fieldProps('categoryId', error)} defaultValue={product?.categoryId ?? ''} required>
              <option value="" disabled>Choose an active category</option>
              {product && !originalCategoryLoaded && <option value={product.categoryId}>{product.categorySlug} (current)</option>}
              {choices.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </Field>
          <ErrorMessage error={categories.error} retry={() => void categories.refetch()} />
          {categories.isLoading && <p role="status" className="text-sm text-muted">Loading categories…</p>}
          {categories.data && choices.length === 0 && <Link to={categoriesPath} className={linkClass}>Create a category first</Link>}
          {categories.hasNextPage && (
            <Button variant="text" disabled={categories.isFetchingNextPage} onClick={() => void categories.fetchNextPage()}>
              {categories.isFetchingNextPage ? 'Loading categories…' : 'Load more categories'}
            </Button>
          )}

          <DescriptionField value={product?.description} error={error} />
          <div className="grid gap-4 rounded-xl border border-border bg-canvas p-4">
            <Field label={product ? 'Replace product images' : 'Product image'} name="image" error={error}>
              <input {...fieldProps('image', error)} ref={imageInput} type="file" accept={acceptedImages.join(',')}
                onChange={selectImage} aria-required={!product || undefined} />
            </Field>
            <p className="text-sm text-muted">Choose one JPEG, PNG, or WebP file from your device, up to 5 MiB.</p>
            {product && <p className="text-sm text-muted">Saving a replacement removes the current images.</p>}
            {selection ? (
              <>
                <img src={selection.preview} alt="Selected product image preview" className="max-h-48 w-full rounded-lg object-contain" />
                <TextField label="Image alternative text (optional)" name="altText" error={error} maxLength={250} />
              </>
            ) : product && (
              <div className={`grid gap-4 ${product.images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                {product.images.length ? product.images.map((image, index) => (
                  <CatalogImage key={index} image={image} name={product.name} />
                )) : <CatalogImage name={product.name} />}
              </div>
            )}
          </div>

          {!product && (
            <section aria-labelledby="product-options-heading" className="space-y-3">
              <h3 id="product-options-heading" className="font-semibold">Product options</h3>
              <p className="text-sm text-muted">Add options such as pack size if variants need different choices. Options are set when the product is created.</p>
              {optionKeys.map((key, index) => (
                <div key={key} className="grid gap-3 rounded-xl border border-border p-4">
                  <TextField label={`Option ${index + 1} name`} name={`option-${key}`} maxLength={100} required />
                  <Field label="Values (one per line)" name={`values-${key}`}>
                    <textarea {...fieldProps(`values-${key}`)} rows={3} maxLength={2020} required />
                  </Field>
                  <div><Button variant="text" onClick={() => setOptionKeys(optionKeys.filter((value) => value !== key))}>Remove option</Button></div>
                </div>
              ))}
              <Button variant="text" disabled={optionKeys.length >= 6}
                onClick={() => { setOptionKeys([...optionKeys, nextKey.current]); nextKey.current += 1 }}>
                Add option
              </Button>
            </section>
          )}

          {saved && <p role="status" className="text-sm font-semibold text-sidebar">Product saved.</p>}
          {error && !['name', 'slug', 'categoryId', 'description', 'image', 'altText'].includes(error.field ?? '') && <ErrorMessage error={error} />}
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={!product && !choices.length}>{busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}</Button>
            <Link to={productsPath} className={linkClass}>Back to products</Link>
          </div>
        </fieldset>
      </form>
    </Panel>
  )
}

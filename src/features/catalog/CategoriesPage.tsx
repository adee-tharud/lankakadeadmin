import { useState, type FormEvent } from 'react'
import { Button } from '../../shared/ui/Button'
import type { ApiError } from '../../shared/api/request'
import { useArchiveCatalogEntryMutation, useCategoriesQuery, useSaveCategoryMutation } from './catalogApi'
import type { AdminCategory } from './catalogTypes'
import {
  CatalogActionButton, CatalogHeader, CatalogStatus, DescriptionField, ErrorMessage,
  Pagination, Panel, TextField,
} from './CatalogUi'
import { CatalogSearch } from './CatalogSearch'
import { formError, useCatalogPage } from './catalogUiState'

function CategoryForm({ category, close }: { category?: AdminCategory; close: () => void }) {
  const [save, { isLoading }] = useSaveCategoryMutation()
  const [error, setError] = useState<ApiError>()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isLoading) return
    const fields = new FormData(event.currentTarget)
    setError(undefined)
    try {
      await save({
        id: category?.id,
        details: {
          name: String(fields.get('name')).trim(),
          slug: String(fields.get('slug')).trim(),
          description: String(fields.get('description')).trim() || null,
        },
      }).unwrap()
      close()
    } catch (failure) {
      setError(formError(failure))
    }
  }

  return (
    <Panel>
      <h2 className="mb-4 text-lg font-semibold">{category ? 'Edit category' : 'Add category'}</h2>
      <form onSubmit={submit}>
        <fieldset disabled={isLoading} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" name="name" error={error} defaultValue={category?.name} maxLength={120} required autoComplete="off" />
            <TextField label="Slug" name="slug" error={error} defaultValue={category?.slug} maxLength={160}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="spices-and-herbs" required autoComplete="off" />
          </div>
          <DescriptionField value={category?.description} error={error} />
          {!error?.field && <ErrorMessage error={error} />}
          <div className="flex flex-wrap gap-4">
            <Button type="submit">{isLoading ? 'Saving…' : 'Save category'}</Button>
            <Button variant="text" onClick={close}>Cancel</Button>
          </div>
        </fieldset>
      </form>
    </Panel>
  )
}

export function CategoriesPage() {
  const [editing, setEditing] = useState<AdminCategory | 'new'>()
  const paging = useCatalogPage()
  const { currentData, error, isFetching, refetch } = useCategoriesQuery(paging.query)
  const [archive] = useArchiveCatalogEntryMutation()

  return (
    <>
      <CatalogHeader title="Categories" description="Organize products into groups customers can browse.">
        <Button onClick={() => setEditing('new')}>Add category</Button>
      </CatalogHeader>

      <div className="space-y-5">
        {editing && <CategoryForm key={editing === 'new' ? editing : editing.id}
          category={editing === 'new' ? undefined : editing} close={() => setEditing(undefined)} />}

        <Panel>
          <h2 className="mb-4 text-lg font-semibold">All categories</h2>
          <CatalogSearch label="Search categories" query={paging.query.q} onSearch={paging.search} />
          <ErrorMessage error={error} retry={() => void refetch()} />
          {isFetching && !currentData && <p role="status" className="text-sm text-muted">Loading categories…</p>}
          {currentData?.categories.length === 0 && (
            <p role="status" className="text-sm text-muted">{paging.query.q ? 'No matching categories.' : 'No categories yet.'}</p>
          )}
          {!!currentData?.categories.length && (
            <ul className="divide-y divide-border">
              {currentData.categories.map((category) => (
                <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold wrap-anywhere">{category.name}</p>
                    <p className="mt-1 text-sm wrap-anywhere text-muted">{category.slug}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <CatalogStatus archived={category.archivedAt !== null} />
                    {category.archivedAt === null && (
                      <>
                        <Button variant="text" onClick={() => setEditing(category)} aria-label={`Edit ${category.name}`}>Edit</Button>
                        <CatalogActionButton action="Archive" name={category.name}
                          consequence="Products in this category will disappear from the storefront."
                          run={() => archive({ categoryId: category.id }).unwrap()} />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Pagination paging={paging} nextCursor={currentData?.nextCursor} busy={isFetching} />
        </Panel>
      </div>
    </>
  )
}

import { Link } from 'react-router-dom'
import { categoriesPath, newProductPath, productsPath } from '../../app/paths'
import { useProductsQuery } from './catalogApi'
import { CatalogSearch } from './CatalogSearch'
import { CatalogHeader, CatalogLink, CatalogStatus, ErrorMessage, Pagination, Panel } from './CatalogUi'
import { linkClass, useCatalogPage } from './catalogUiState'

export function ProductsPage() {
  const paging = useCatalogPage()
  const { currentData, error, isFetching, refetch } = useProductsQuery(paging.query)

  return (
    <>
      <CatalogHeader title="Products" description="Manage product details, images, and sellable variants.">
        <CatalogLink to={newProductPath}>Add product</CatalogLink>
      </CatalogHeader>
      <Panel>
        <h2 className="mb-4 text-lg font-semibold">All products</h2>
        <CatalogSearch label="Search products" query={paging.query.q} onSearch={paging.search} />
        <ErrorMessage error={error} retry={() => void refetch()} />
        {isFetching && !currentData && <p role="status" className="text-sm text-muted">Loading products…</p>}
        {currentData?.products.length === 0 && (paging.query.q ? (
          <p role="status" className="text-sm text-muted">No matching products.</p>
        ) : (
          <p className="text-sm text-muted">No products yet. Products belong to an active category.{' '}
            <Link to={categoriesPath} className={linkClass}>Manage categories</Link>
          </p>
        ))}
        {!!currentData?.products.length && (
          <ul className="divide-y divide-border">
            {currentData.products.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <Link to={`${productsPath}/${product.id}`} className={linkClass}>{product.name}</Link>
                  <p className="mt-1 text-sm wrap-anywhere text-muted">{product.categorySlug}</p>
                </div>
                <CatalogStatus archived={product.archivedAt !== null} />
              </li>
            ))}
          </ul>
        )}
        <Pagination paging={paging} nextCursor={currentData?.nextCursor} busy={isFetching} />
      </Panel>
    </>
  )
}

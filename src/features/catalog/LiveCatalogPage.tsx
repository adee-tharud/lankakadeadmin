import { Link, useParams } from 'react-router-dom'
import { liveCatalogPath } from '../../app/paths'
import { useLiveProductQuery, useLiveProductsQuery } from './catalogApi'
import { formatPrice, formatVariantChoices } from './catalogDisplay'
import { CatalogSearch } from './CatalogSearch'
import { CatalogHeader, CatalogImage, ErrorMessage, Pagination, Panel } from './CatalogUi'
import { linkClass, useCatalogPage } from './catalogUiState'

export function LiveCatalogPage() {
  const paging = useCatalogPage()
  const { currentData, error, isFetching, refetch } = useLiveProductsQuery(paging.query)

  return (
    <>
      <CatalogHeader title="Live catalog" description="See the products and availability currently visible to storefront customers." />
      <CatalogSearch label="Search live catalog" query={paging.query.q} onSearch={paging.search} />
      <ErrorMessage error={error} retry={() => void refetch()} />
      {isFetching && !currentData && <p role="status" className="text-sm text-muted">Loading storefront catalog…</p>}
      {currentData?.products.length === 0 && (
        <Panel>
          <p role="status" className="text-sm text-muted">
            {paging.query.q ? 'No matching products in the live catalog.' : 'No products are visible in the storefront catalog yet.'}
          </p>
        </Panel>
      )}
      {!!currentData?.products.length && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {currentData.products.map((product) => (
            <li key={product.id} className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold tracking-widest wrap-anywhere text-muted uppercase">{product.categorySlug}</p>
              <h2 className="mt-2 text-lg font-semibold wrap-anywhere">
                <Link to={`${liveCatalogPath}/${encodeURIComponent(product.slug)}`} className={linkClass}>{product.name}</Link>
              </h2>
              <p className="mt-2 text-sm text-muted">From {formatPrice(product.priceFrom)}</p>
              <p className="mt-3 text-sm font-medium text-sidebar">{product.inStock ? 'In stock' : 'Sold out'}</p>
            </li>
          ))}
        </ul>
      )}
      <Pagination paging={paging} nextCursor={currentData?.nextCursor} busy={isFetching} />
    </>
  )
}

export function LiveProductPage() {
  const { slug = '' } = useParams()
  const { currentData, error, isFetching, refetch } = useLiveProductQuery(slug)
  const product = currentData?.product

  return (
    <>
      <CatalogHeader title={product?.name ?? 'Storefront product'} description="Storefront preview">
        <Link to={liveCatalogPath} className={linkClass}>Back to live catalog</Link>
      </CatalogHeader>
      <div className="space-y-5">
        <ErrorMessage error={error} retry={() => void refetch()} />
        {isFetching && !product && <p role="status" className="text-sm text-muted">Loading product…</p>}
        {product && (
          <>
            <Panel>
              <div className={`grid gap-4 ${product.images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                {product.images.length ? product.images.map((image, index) => (
                  <CatalogImage key={index} image={image} name={product.name} />
                )) : <CatalogImage name={product.name} />}
              </div>
              {product.description && <p className="mt-4 whitespace-pre-wrap wrap-anywhere text-muted">{product.description}</p>}
            </Panel>
            <Panel>
              <h2 className="mb-2 text-lg font-semibold">Available options</h2>
              <ul className="divide-y divide-border">
                {product.variants.map((variant) => (
                  <li key={variant.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
                    <span className="font-medium">{formatVariantChoices(variant, product.options)}</span>
                    <span className="text-muted">{formatPrice(variant.price)} · {variant.availability === 'in_stock' ? 'In stock' : 'Sold out'}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}
      </div>
    </>
  )
}

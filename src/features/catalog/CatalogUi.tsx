import { useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ApiError } from '../../shared/api/request'
import { Button } from '../../shared/ui/Button'
import type { ProductImage } from './catalogTypes'
import { productImageUrl } from './catalogDisplay'
import { fieldProps, formError, type useCatalogPage } from './catalogUiState'

export function CatalogHeader({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-border bg-surface-accent px-5 py-6 sm:px-7">
      <div>
        <p className="text-xs font-semibold tracking-widest text-sidebar uppercase">Catalog</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>
      {children}
    </header>
  )
}

export function CatalogLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex rounded-xl bg-sidebar px-4 py-3 text-sm font-semibold text-on-sidebar hover:bg-focus focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">
      {children}
    </Link>
  )
}

export function Panel({ children }: { children: ReactNode }) {
  return <section className="rounded-xl border border-border bg-surface p-4 sm:p-6">{children}</section>
}

export function ErrorMessage({ error, retry }: { error?: { message?: string }; retry?: () => void }) {
  if (!error) return null
  return (
    <div className="rounded-lg bg-error-surface px-3 py-2.5 text-sm text-error">
      <p role="alert">{error.message || 'The request could not be completed. Try again.'}</p>
      {retry && <Button variant="text" onClick={retry} className="mt-2">Try again</Button>}
    </div>
  )
}

export function Field({ label, name, error, children }: { label: string; name: string; error?: ApiError; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold">{label}</label>
      {children}
      {error?.field === name && <p id={`${name}-error`} role="alert" className="text-sm text-error">{error.message}</p>}
    </div>
  )
}

export function TextField({ label, name, error, ...props }: ComponentProps<'input'> & { label: string; name: string; error?: ApiError }) {
  return <Field label={label} name={name} error={error}><input {...fieldProps(name, error)} {...props} /></Field>
}

export function DescriptionField({ value, error }: { value?: string | null; error?: ApiError }) {
  return (
    <Field label="Description" name="description" error={error}>
      <textarea {...fieldProps('description', error)} rows={3} maxLength={2000} defaultValue={value ?? ''} />
    </Field>
  )
}

export function Pagination({ paging, nextCursor, busy }: { paging: ReturnType<typeof useCatalogPage>; nextCursor?: string | null; busy: boolean }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
      <Button variant="text" disabled={busy || paging.page === 1} onClick={paging.previous}>Previous</Button>
      <span className="text-muted">Page {paging.page}</span>
      <Button variant="text" disabled={busy || !nextCursor} onClick={() => nextCursor && paging.next(nextCursor)}>Next</Button>
    </div>
  )
}

export function CatalogStatus({ archived }: { archived: boolean }) {
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${archived ? 'bg-canvas text-muted' : 'bg-surface-accent text-sidebar'}`}>
    {archived ? 'Archived' : 'Active'}
  </span>
}

export function CatalogActionButton({ action, name, consequence, run }: {
  action: 'Archive' | 'Restore'; name: string; consequence: string; run: () => Promise<unknown>
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError>()

  async function confirm() {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError(undefined)
    try {
      await run()
      dialog.current?.close()
    } catch (failure) {
      setError(formError(failure))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="text" onClick={() => { setError(undefined); dialog.current?.showModal() }}>{action}</Button>
      <dialog ref={dialog} aria-label={`${action} ${name}`} onCancel={(event) => { if (pending.current) event.preventDefault() }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-6 text-ink backdrop:bg-ink/45">
        <h2 className="text-lg font-semibold wrap-anywhere">{action} {name}?</h2>
        <p className="my-3 text-sm text-muted">{consequence}</p>
        <ErrorMessage error={error} />
        <div className="mt-5 flex justify-end gap-4">
          <Button variant="text" disabled={busy} onClick={() => dialog.current?.close()}>Cancel</Button>
          <Button disabled={busy} onClick={confirm}>{busy ? 'Working…' : `Confirm ${action.toLowerCase()}`}</Button>
        </div>
      </dialog>
    </>
  )
}

export function CatalogImage({ image, name }: { image?: ProductImage; name: string }) {
  const url = image && productImageUrl(image.url)
  if (!url) return <p className="text-sm text-muted">No product image.</p>
  return <img src={url} alt={image.altText || name} referrerPolicy="no-referrer" className="max-h-64 w-full rounded-lg object-contain" />
}

import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ApiError } from '../../shared/api/request'

const inputClass = 'w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-ink outline-none focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30 aria-invalid:border-error'
export const linkClass = 'rounded font-semibold text-sidebar underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus'
export const catalogSearchLimit = 100
export const catalogSearchMinimum = 3

export function catalogSearchTerm(value: string) {
  const term = value.trim().slice(0, catalogSearchLimit)
  return [...term].length >= catalogSearchMinimum ? term : ''
}

export function formError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error as ApiError
  }
  return { status: 'network', code: 'REQUEST_FAILED', message: 'The request could not be completed. Try again.' }
}

export function fieldProps(name: string, error?: ApiError) {
  return { id: name, name, className: inputClass, 'aria-invalid': error?.field === name || undefined,
    'aria-describedby': error?.field === name ? `${name}-error` : undefined }
}

export function useCatalogPage() {
  const [params, setParams] = useSearchParams()
  const q = catalogSearchTerm(params.get('q') ?? '')
  const [history, setHistory] = useState({ q, cursors: [] as string[] })
  const cursors = history.q === q ? history.cursors : []

  const search = useCallback((term: string) => {
    if (term === q && params.get('q') === (term || null)) return
    setHistory({ q: term, cursors: [] })
    const next = new URLSearchParams(params)
    if (term) next.set('q', term)
    else next.delete('q')
    setParams(next, { replace: true })
  }, [params, q, setParams])

  return {
    query: { after: cursors.at(-1), q },
    page: cursors.length + 1,
    search,
    previous: () => setHistory({ q, cursors: cursors.slice(0, -1) }),
    next: (cursor: string) => setHistory({ q, cursors: [...cursors, cursor] }),
  }
}

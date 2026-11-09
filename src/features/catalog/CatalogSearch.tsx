import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../shared/ui/Button'
import { TextField } from './CatalogUi'
import { catalogSearchLimit, catalogSearchMinimum, catalogSearchTerm } from './catalogUiState'

type CatalogSearchProps = {
  label: string
  query: string
  onSearch: (query: string) => void
}

const searchDelayMs = 300

export function CatalogSearch({ label, query, onSearch }: CatalogSearchProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState({ query, value: query })
  const [composing, setComposing] = useState(false)
  const value = draft.query === query ? draft.value : query
  const term = catalogSearchTerm(value)

  useEffect(() => {
    if (composing || term === query) return
    const timer = window.setTimeout(() => {
      setDraft({ query: term, value })
      onSearch(term)
    }, term ? searchDelayMs : 0)
    return () => window.clearTimeout(timer)
  }, [composing, onSearch, query, term, value])

  function clear() {
    setDraft({ query: '', value: '' })
    onSearch('')
    input.current?.focus()
  }

  return (
    <div role="search" aria-label={label} className="mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-48">
          <TextField
            ref={input}
            label={label}
            name={id}
            type="search"
            placeholder="Name or slug"
            aria-describedby={`${id}-hint`}
            maxLength={catalogSearchLimit}
            value={value}
            onChange={(event) => setDraft({ query, value: event.target.value })}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
          />
        </div>
        {(value || query) && <Button variant="text" className="self-end py-2.5" onClick={clear}>Clear</Button>}
      </div>
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">Type at least {catalogSearchMinimum} characters to filter.</p>
    </div>
  )
}

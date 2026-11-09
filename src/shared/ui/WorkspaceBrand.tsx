export function WorkspaceBrand() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-on-sidebar text-sidebar" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10h16l-2 9H6l-2-9ZM9 10l3-5 3 5M9 13v3m6-3v3" />
        </svg>
      </span>
      <div>
        <p className="text-base font-semibold leading-5">LankaKade</p>
        <p className="text-xs text-on-sidebar/75">Admin workspace</p>
      </div>
    </div>
  )
}

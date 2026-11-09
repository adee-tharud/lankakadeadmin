import { NavLink } from 'react-router-dom'
import { Button } from '../../shared/ui/Button'
import { WorkspaceBrand } from '../../shared/ui/WorkspaceBrand'
import { categoriesPath, dashboardPath, liveCatalogPath, productsPath } from '../paths'

const navigationClass = 'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors hover:bg-on-sidebar/10 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-on-sidebar aria-[current=page]:bg-on-sidebar aria-[current=page]:text-sidebar'
const catalogLinks = [
  { to: categoriesPath, label: 'Categories' },
  { to: productsPath, label: 'Products' },
  { to: liveCatalogPath, label: 'Live catalog' },
]

type AdminSidebarProps = {
  fullName: string
  signingOut: boolean
  signOutError?: string
  onSignOut: () => void
  onClose?: () => void
}

export function AdminSidebar({ fullName, signingOut, signOutError, onSignOut, onClose }: AdminSidebarProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-sidebar text-on-sidebar">
      <div className="flex items-center justify-between gap-2 px-5 pt-6">
        <WorkspaceBrand />
        {onClose && (
          <Button variant="inverse" onClick={onClose} aria-label="Close navigation">
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </Button>
        )}
      </div>

      <nav aria-label="Admin navigation" className="px-3 pt-9 pb-6">
        <p className="mb-3 px-3 text-xs font-semibold tracking-widest text-on-sidebar/75 uppercase">Workspace</p>
        <NavLink
          to={dashboardPath}
          end
          onClick={onClose}
          className={navigationClass}
        >
          <svg viewBox="0 0 24 24" className="size-[1.125rem]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </NavLink>
        <p className="mt-7 mb-2 px-3 text-xs font-semibold tracking-widest text-on-sidebar/75 uppercase">Catalog</p>
        {catalogLinks.map(({ to, label }) => (
          <NavLink key={to} to={to} onClick={onClose} className={navigationClass}>{label}</NavLink>
        ))}
      </nav>

      <footer className="mt-auto border-t border-on-sidebar/20 px-5 py-5">
        <p className="text-xs font-medium tracking-widest text-on-sidebar/75 uppercase">Administrator</p>
        <p className="mt-1 mb-4 text-sm font-semibold wrap-anywhere">{fullName}</p>
        {signOutError && (
          <p role="alert" className="mb-3 rounded-lg bg-error-surface px-3 py-2 text-sm text-error">{signOutError}</p>
        )}
        <Button variant="inverse" disabled={signingOut} onClick={onSignOut}>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </footer>
    </div>
  )
}

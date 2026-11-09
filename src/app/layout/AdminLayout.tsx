import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { signOut, type AdminAccount } from '../../features/auth/authApi'
import { Button } from '../../shared/ui/Button'
import { WorkspaceBrand } from '../../shared/ui/WorkspaceBrand'
import { AdminSidebar } from './AdminSidebar'

type AdminLayoutProps = {
  account: AdminAccount
  onSignedOut: () => void
}

export function AdminLayout({ account, onSignedOut }: AdminLayoutProps) {
  const drawer = useRef<HTMLDialogElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const main = useRef<HTMLElement>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string>()

  useEffect(() => {
    const button = menuButton.current
    if (!button) return

    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === 0 && drawer.current?.open) drawer.current.close()
    })
    observer.observe(button)
    return () => observer.disconnect()
  }, [])

  function closeDrawer() {
    drawer.current?.close()
  }

  function restoreDrawerFocus() {
    const button = menuButton.current
    if (button?.getClientRects().length) button.focus()
    else main.current?.focus()
  }

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    setSignOutError(undefined)

    try {
      const failure = await signOut()
      if (failure) setSignOutError(failure.message)
      else onSignedOut()
    } finally {
      setSigningOut(false)
    }
  }

  const sidebarProps = { fullName: account.fullName, signingOut, signOutError, onSignOut: handleSignOut }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <a href="#admin-content" className="sr-only rounded-lg bg-surface px-3 py-2 text-sidebar focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-20">
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh self-start lg:block">
        <AdminSidebar {...sidebarProps} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-sidebar px-4 py-3 text-on-sidebar sm:px-6 lg:hidden">
          <WorkspaceBrand />
          <Button
            variant="inverse"
            ref={menuButton}
            aria-haspopup="dialog"
            aria-controls="admin-navigation"
            onClick={() => drawer.current?.showModal()}
            className="flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </Button>
        </header>

        <main id="admin-content" ref={main} tabIndex={-1} className="mx-auto max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-9">
          <Outlet />
        </main>
      </div>

      <dialog
        id="admin-navigation"
        ref={drawer}
        aria-label="Admin menu"
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] p-0 backdrop:bg-ink/45 lg:hidden"
        onClose={restoreDrawerFocus}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDrawer()
        }}
      >
        <AdminSidebar {...sidebarProps} onClose={closeDrawer} />
      </dialog>
    </div>
  )
}

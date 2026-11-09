import { useState } from 'react'
import { signOut, type AdminAccount } from '../auth/authApi'
import { Button } from '../../shared/ui/Button'

type Props = {
  account: AdminAccount
  onSignedOut: () => void
}

export function DashboardPage({ account, onSignedOut }: Props) {
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string>()

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    setError(undefined)

    try {
      const failure = await signOut()
      if (failure) setError(failure.message)
      else onSignedOut()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <>
      <header className="bg-sidebar px-5 py-4 text-on-sidebar sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="font-semibold">LankaKade Admin</p>
          <Button variant="inverse" disabled={signingOut} onClick={handleSignOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {error && <p role="alert" className="mb-4 rounded-lg bg-error-surface px-4 py-3 text-sm text-error">{error}</p>}
        <section className="rounded-2xl border border-border bg-surface-accent px-6 py-8">
          <p className="text-xs font-semibold tracking-widest text-sidebar uppercase">Store operations</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted">Welcome, {account.fullName}.</p>
        </section>
      </main>
    </>
  )
}

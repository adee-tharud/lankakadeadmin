type DashboardPageProps = {
  fullName: string
}

export function DashboardPage({ fullName }: DashboardPageProps) {
  return (
    <>
      <p className="mb-4 flex items-center gap-2 text-sm font-medium text-muted">
        <svg viewBox="0 0 24 24" className="size-4 text-sidebar" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 5-8 10-8 10s-8-5-8-10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        Romania storefront
      </p>
      <section aria-labelledby="dashboard-heading" className="rounded-2xl border border-border bg-surface-accent px-5 py-7 sm:px-8 sm:py-9">
        <p className="text-xs font-semibold tracking-widest text-sidebar uppercase">Store operations</p>
        <h1 id="dashboard-heading" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Dashboard</h1>
        <p className="mt-3 text-sm leading-6 wrap-anywhere text-muted sm:text-base">Welcome, {fullName}.</p>
      </section>
    </>
  )
}

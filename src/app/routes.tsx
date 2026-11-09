import { useEffect, useRef } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useAdminSessionQuery } from '../features/auth/authApi'
import { SignInPage } from '../features/auth/SignInPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { CategoriesPage } from '../features/catalog/CategoriesPage'
import { LiveCatalogPage, LiveProductPage } from '../features/catalog/LiveCatalogPage'
import { NewProductPage, ProductPage } from '../features/catalog/ProductPage'
import { ProductsPage } from '../features/catalog/ProductsPage'
import { adminApi } from '../shared/api/adminApi'
import type { ApiError } from '../shared/api/request'
import { Button } from '../shared/ui/Button'
import { useAppDispatch } from './hooks'
import { AdminLayout } from './layout/AdminLayout'
import { categoriesPath, dashboardPath, liveCatalogPath, newProductPath, productsPath } from './paths'

const signInPath = '/sign-in'

function SessionNotice({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center p-5">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7">
        <h1 className="text-xl font-semibold">LankaKade Admin</h1>
        <p className="mt-2 text-sm text-muted" role={retry ? 'alert' : 'status'}>{message}</p>
        {retry && (
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold text-sidebar">
            <Button onClick={retry}>Try again</Button>
            <Link to={signInPath} className="underline underline-offset-4">Go to sign-in</Link>
          </div>
        )}
      </div>
    </main>
  )
}

export function AppRoutes() {
  const dispatch = useAppDispatch()
  const hadSession = useRef(false)
  const session = useAdminSessionQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 60_000,
    skipPollingIfUnfocused: true,
  })
  const account = session.isError ? undefined : session.data
  const checkingSession = session.isLoading || session.isUninitialized
  const denied = session.error && 'status' in session.error && session.error.status === 403

  useEffect(() => {
    if (account) hadSession.current = true
    if (hadSession.current && (account === null || denied)) {
      hadSession.current = false
      dispatch(adminApi.util.resetApiState())
    }
  }, [account, denied, dispatch])

  async function confirmSession(): Promise<ApiError | undefined> {
    const result = await session.refetch()
    if (result.error && 'status' in result.error) return result.error
    if (result.data && !result.error) return
    return {
      status: 401,
      code: 'SESSION_UNAVAILABLE',
      message: 'We could not verify your session. Allow cookies for this site and sign in again.',
    }
  }

  function clearSession() {
    hadSession.current = false
    dispatch(adminApi.util.resetApiState())
  }

  let protectedLayout = <Navigate to={signInPath} replace />
  if (checkingSession) {
    protectedLayout = <SessionNotice message="Checking your session…" />
  } else if (session.isError) {
    protectedLayout = (
      <SessionNotice
        message={session.error?.message ?? 'We could not verify your session.'}
        retry={() => void session.refetch()}
      />
    )
  } else if (account) {
    protectedLayout = <AdminLayout account={account} onSignedOut={clearSession} />
  }

  return (
    <Routes>
      <Route path={signInPath} element={
        account ? <Navigate to={dashboardPath} replace /> :
          checkingSession ? <SessionNotice message="Checking your session…" /> :
            <SignInPage confirmSession={confirmSession} />
      } />
      <Route element={protectedLayout}>
        <Route index element={<Navigate to={dashboardPath} replace />} />
        <Route path={dashboardPath} element={account && <DashboardPage fullName={account.fullName} />} />
        <Route path={categoriesPath} element={<CategoriesPage />} />
        <Route path={productsPath} element={<ProductsPage />} />
        <Route path={newProductPath} element={<NewProductPage />} />
        <Route path={`${productsPath}/:productId`} element={<ProductPage />} />
        <Route path={liveCatalogPath} element={<LiveCatalogPage />} />
        <Route path={`${liveCatalogPath}/:slug`} element={<LiveProductPage />} />
      </Route>
      <Route path="*" element={<Navigate to={dashboardPath} replace />} />
    </Routes>
  )
}

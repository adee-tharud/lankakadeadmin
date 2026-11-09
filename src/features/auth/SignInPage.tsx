import { useEffect, useRef, useState, type FormEvent } from 'react'
import { signIn } from './authApi'
import type { ApiError } from '../../shared/api/request'
import { Button } from '../../shared/ui/Button'
import { WorkspaceBrand } from '../../shared/ui/WorkspaceBrand'

const inputStyle = 'mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30 aria-invalid:border-error'

type Props = {
  confirmSession: () => Promise<ApiError | undefined>
}

export function SignInPage({ confirmSession }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [requiresMfa, setRequiresMfa] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError>()
  const emailInput = useRef<HTMLInputElement>(null)
  const codeInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (requiresMfa) codeInput.current?.focus()
  }, [requiresMfa])

  function handleBackToSignIn() {
    setRequiresMfa(false)
    setMfaCode('')
    setError(undefined)
    requestAnimationFrame(() => emailInput.current?.focus())
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(undefined)

    try {
      const error = await signIn({ email: email.trim(), password, mfaCode: requiresMfa ? mfaCode.trim() : undefined })

      if (error?.code === 'MFA_REQUIRED') {
        setRequiresMfa(true)
        return
      }
      if (error) {
        setError(requiresMfa && error.code === 'INVALID_CREDENTIALS'
          ? { ...error, field: 'mfaCode', message: 'Check the code and try again, or go back to update your sign-in details.' }
          : error)
        return
      }

      const sessionError = await confirmSession()
      if (sessionError) {
        setRequiresMfa(false)
        setPassword('')
        setMfaCode('')
        setError(sessionError)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (field: string) => error?.field === field ? error.message : undefined
  const formError = error && (requiresMfa ? error.field !== 'mfaCode' : !['email', 'password'].includes(error.field ?? ''))

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-6 sm:px-8 sm:py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-sidebar/5 lg:min-h-[36rem] lg:grid-cols-[2fr_3fr]">
        <aside className="relative flex flex-col justify-between overflow-hidden bg-sidebar px-7 py-6 text-on-sidebar sm:px-10 lg:py-10">
          <div className="relative z-10">
            <WorkspaceBrand />
          </div>

          <svg viewBox="0 0 320 240" className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-40 text-on-sidebar/20 lg:inset-x-0 lg:top-[22%] lg:h-auto lg:w-full" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="160" cy="119" r="107" />
            <circle cx="160" cy="119" r="96" strokeDasharray="2 5" />
            <path d="M85 187h150M108 187v-65m104 65v-65M103 95l13-29h88l13 29v13a11 11 0 0 1-22 0 11 11 0 0 1-22 0 11 11 0 0 1-22 0 11 11 0 0 1-22 0 13 13 0 0 1-26 0V95Zm0 0h114m-88 13 7-42m15 42 3-42m19 42-3-42m25 42-7-42M126 187v-49h29v49m15-49h25v27h-25zm12 0v27m-12-14h25m-51 13h3" />
            <path d="M89 187c-12-15-16-32-15-48 13 7 19 19 15 38m0-9c1-10 7-19 15-24m125 43c7-14 12-30 10-42-10 6-14 17-13 29m11 0c7-6 14-8 21-8-6 10-14 13-25 13" />
          </svg>

          <div className="relative z-10 hidden border-t border-on-sidebar/20 pt-5 lg:block">
            <p className="text-xs font-medium tracking-widest text-on-sidebar/75 uppercase">Store operations</p>
            <p className="mt-2 text-sm">Romania storefront</p>
          </div>
        </aside>

        <section className="flex items-center px-7 py-9 sm:px-12 sm:py-12 lg:px-16" aria-labelledby="sign-in-title">
          <div className="mx-auto w-full max-w-sm">
            <p className="mb-3 text-xs font-semibold tracking-widest text-sidebar uppercase">Staff access</p>
            <h1 id="sign-in-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {requiresMfa ? 'Verify your sign-in' : 'Sign in'}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              {requiresMfa
                ? 'Enter a six-digit authenticator code or a recovery code.'
                : 'Use your administrator account to access the LankaKade workspace.'}
            </p>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              {requiresMfa ? (
                <>
                  <p className="rounded-lg bg-surface-accent px-3 py-2 text-sm break-all text-ink">{email.trim()}</p>
                  <div>
                    <label htmlFor="mfaCode" className="text-sm font-medium">Authenticator or recovery code</label>
                    <input id="mfaCode" name="mfaCode" ref={codeInput} autoComplete="one-time-code" autoCapitalize="none"
                      spellCheck={false} maxLength={32} required value={mfaCode} readOnly={submitting}
                      onChange={(event) => setMfaCode(event.target.value)} className={inputStyle}
                      aria-invalid={!!fieldError('mfaCode')} aria-describedby={fieldError('mfaCode') ? 'mfa-error' : undefined} />
                    {fieldError('mfaCode') && <p id="mfa-error" role="alert" className="mt-2 text-sm text-error">{fieldError('mfaCode')}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium">Email address</label>
                    <input id="email" name="email" ref={emailInput} type="email" autoComplete="username" maxLength={254}
                      required value={email} readOnly={submitting} onChange={(event) => setEmail(event.target.value)} className={inputStyle}
                      aria-invalid={!!fieldError('email')} aria-describedby={fieldError('email') ? 'email-error' : undefined} />
                    {fieldError('email') && <p id="email-error" role="alert" className="mt-2 text-sm text-error">{fieldError('email')}</p>}
                  </div>
                  <div>
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <input id="password" name="password" type="password" autoComplete="current-password" required
                      value={password} readOnly={submitting} onChange={(event) => setPassword(event.target.value)} className={inputStyle}
                      aria-invalid={!!fieldError('password')} aria-describedby={fieldError('password') ? 'password-error' : undefined} />
                    {fieldError('password') && <p id="password-error" role="alert" className="mt-2 text-sm text-error">{fieldError('password')}</p>}
                  </div>
                </>
              )}

              {formError && <p role="alert" className="rounded-lg bg-error-surface px-3 py-2.5 text-sm text-error">{error.message}</p>}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Signing in…' : requiresMfa ? 'Verify and sign in' : 'Continue'}
              </Button>
              {requiresMfa && (
                <Button variant="text" disabled={submitting} onClick={handleBackToSignIn}>
                  Back to sign-in details
                </Button>
              )}
            </form>

            <div className="mt-7 flex items-center gap-2 border-t border-border pt-5 text-xs text-muted">
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
              </svg>
              Protected by two-step verification
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

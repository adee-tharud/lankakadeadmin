import { adminApi } from '../../shared/api/adminApi'
import { request, type ApiError } from '../../shared/api/request'

export type AdminAccount = { id: string; fullName: string }

type Credentials = { email: string; password: string; mfaCode?: string }

const invalidResponse: ApiError = {
  status: 502,
  code: 'INVALID_RESPONSE',
  message: 'The admin service returned an unexpected response. Try again.',
}

function readAccount(data: unknown) {
  if (!data || typeof data !== 'object' || !('user' in data)) return null
  const { user } = data
  if (!user || typeof user !== 'object' || !('id' in user) || typeof user.id !== 'string' ||
      !('role' in user) || (user.role !== 'admin' && user.role !== 'customer')) return null

  return {
    id: user.id,
    role: user.role,
    fullName: 'fullName' in user && typeof user.fullName === 'string' ? user.fullName : null,
  }
}

export async function signIn(credentials: Credentials): Promise<ApiError | undefined> {
  // Keep passwords and MFA codes out of Redux actions and its dev tools.
  const result = await request({ path: '/auth/login', method: 'POST', body: credentials })
  if (result.error) return result.error

  const account = readAccount(result.data)
  if (!account) return invalidResponse
  if (account.role !== 'admin') return {
    status: 403,
    code: 'ADMIN_REQUIRED',
    message: 'Use your LankaKade administrator account to sign in.',
  }
}

export async function signOut(): Promise<ApiError | undefined> {
  const result = await request({ path: '/auth/logout', method: 'POST' })
  if (result.error?.status !== 401) return result.error
}

const authApi = adminApi.injectEndpoints({
  endpoints: (build) => ({
    adminSession: build.query<AdminAccount | null, void>({
      async queryFn(_arg, _api, _options, baseQuery) {
        const result = await baseQuery({ path: '/account' })
        if (result.error) {
          return result.error.status === 401 ? { data: null } : { error: result.error }
        }

        const account = readAccount(result.data)
        if (!account || account.fullName === null) return { error: invalidResponse }
        return { data: account.role === 'admin' ? { id: account.id, fullName: account.fullName } : null }
      },
    }),
  }),
})

export const { useAdminSessionQuery } = authApi

import { apiOrigin } from '../config/env'

export type ApiError = {
  status: number | 'configuration' | 'network'
  code: string
  message: string
  field?: string
}

export type ApiRequest =
  | { path: string; method?: 'GET'; public?: boolean }
  | { path: string; method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: object }

type ApiResult = { data: unknown; error?: undefined } | { data?: undefined; error: ApiError }

export async function request(args: ApiRequest, signal?: AbortSignal): Promise<ApiResult> {
  if (!apiOrigin) {
    return { error: {
      status: 'configuration',
      code: 'API_NOT_CONFIGURED',
      message: 'The admin service is unavailable. Contact your administrator.',
    } }
  }

  const input = 'body' in args ? args.body : undefined
  const multipart = input instanceof FormData
  const body = multipart ? input : input === undefined ? undefined : JSON.stringify(input)
  const timeout = AbortSignal.timeout(multipart ? 30_000 : 12_000)

  try {
    const response = await fetch(`${apiOrigin}/api/v1${args.path}`, {
      method: args.method ?? 'GET',
      body,
      headers: multipart || body === undefined ? undefined : { 'Content-Type': 'application/json' },
      credentials: 'public' in args && args.public ? 'omit' : 'include',
      cache: 'no-store',
      redirect: 'error',
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    })

    if (response.status === 204) return { data: null }

    const data: unknown = await response.json().catch(() => undefined)
    if (response.ok) return { data }
    if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' &&
        'message' in data && typeof data.message === 'string') {
      const field = 'field' in data && typeof data.field === 'string' ? data.field : undefined
      return { error: { status: response.status, code: data.error, message: data.message, field } }
    }

    return { error: {
      status: response.status,
      code: 'REQUEST_FAILED',
      message: 'The admin service could not complete the request. Try again.',
    } }
  } catch {
    return { error: {
      status: 'network',
      code: 'NETWORK_ERROR',
      message: 'We could not reach the admin service. Check your connection and try again.',
    } }
  }
}

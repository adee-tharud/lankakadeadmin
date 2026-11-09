import { createApi } from '@reduxjs/toolkit/query/react'
import { request } from './request'

export const adminApi = createApi({
  reducerPath: 'adminApi',
  tagTypes: ['Catalog', 'Session'],
  async baseQuery(args: Parameters<typeof request>[0], { signal, dispatch, endpoint }): ReturnType<typeof request> {
    const result = await request(args, signal)
    if (endpoint !== 'adminSession' && result.error?.status === 401) {
      dispatch(adminApi.util.invalidateTags(['Session']))
    }
    return result
  },
  endpoints: () => ({}),
})

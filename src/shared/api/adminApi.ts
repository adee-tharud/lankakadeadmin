import { createApi } from '@reduxjs/toolkit/query/react'
import { request } from './request'

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: (args: Parameters<typeof request>[0], { signal }) => request(args, signal),
  endpoints: () => ({}),
})

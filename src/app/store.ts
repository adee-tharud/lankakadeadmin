import { combineSlices, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { adminApi } from '../shared/api/adminApi'

export const store = configureStore({
  reducer: combineSlices(adminApi),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(adminApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

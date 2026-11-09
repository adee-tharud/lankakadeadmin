function readApiOrigin(): string | null {
  const value = import.meta.env.VITE_API_ORIGIN?.trim()
  if (!value) return null

  try {
    const url = new URL(value)
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) return null
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null
    return url.origin === window.location.origin ? null : url.origin
  } catch {
    return null
  }
}

export const apiOrigin = readApiOrigin()

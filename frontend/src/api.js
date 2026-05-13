// API utility to handle backend URL in both development and production
const API_URL = import.meta.env.VITE_API_URL || '';

export function apiUrl(path) {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

export async function fetchJsonWithRetry(url, options = {}, cfg = {}) {
  const {
    timeoutMs = 12000,
    retries = 2,
    retryDelayMs = 2500
  } = cfg

  let lastErr = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs)
      const text = await res.text()
      if (!res.ok) throw new Error(text || res.statusText)
      return text ? JSON.parse(text) : null
    } catch (e) {
      lastErr = e
      // retry only on abort / network-ish failures
      const msg = String(e?.message || '')
      const canRetry = attempt < retries && (e?.name === 'AbortError' || /fetch/i.test(msg) || /network/i.test(msg))
      if (!canRetry) break
      await new Promise(r => setTimeout(r, retryDelayMs))
    }
  }
  throw lastErr || new Error('Request failed')
}

export default apiUrl;

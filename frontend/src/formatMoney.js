/**
 * Strip grouping commas and whitespace for API / parsing.
 */
export function normalizeRupeeString(value) {
  if (value == null || value === '') return '0'
  return String(value).replace(/,/g, '').trim()
}

export function parseRupeeNumber(value) {
  const n = Number(normalizeRupeeString(value))
  return Number.isFinite(n) ? n : 0
}

/** Indian grouping: e.g. 100000 → ₹1,00,000 */
export function formatINR(amount) {
  const n = typeof amount === 'number' ? amount : parseRupeeNumber(amount)
  if (!Number.isFinite(n)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(n)
}

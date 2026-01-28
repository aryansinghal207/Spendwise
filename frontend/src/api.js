// API utility to handle backend URL in both development and production
const API_URL = import.meta.env.VITE_API_URL || '';

export function apiUrl(path) {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
}

export default apiUrl;

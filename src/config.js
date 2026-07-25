const normalizeBaseUrl = (value = '') => value.trim().replace(/\/$/, '')

export const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)
export const AI_API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_AI_API_BASE_URL)

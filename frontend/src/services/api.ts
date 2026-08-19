const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const API_BASE_URL = configuredBaseUrl.replace(/\/$/, '')
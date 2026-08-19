export class FetchTimeoutError extends Error {
  constructor(message = 'Request timed out. Please try again.') {
    super(message)
    this.name = 'FetchTimeoutError'
  }
}

export async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(input, { ...(init || {}), signal: controller.signal })
    clearTimeout(id)
    return response
  } catch (err: unknown) {
    clearTimeout(id)
    const e = err as Error & { name?: string }
    if (e && e.name === 'AbortError') {
      throw new FetchTimeoutError()
    }

    throw new Error('Unable to connect to CivicAI. Please make sure the backend is running.')
  }
}

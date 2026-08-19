const MAX_ATTEMPTS = 3

const isTemporaryStatus = (err) => {
  const status = err && (err.status || err.statusCode || err?.response?.status)
  const msg = (err && err.message) ? String(err.message).toLowerCase() : ''

  if (status === 429 || msg.includes('rate limit') || msg.includes('too many requests')) return 'RATE_LIMIT_ERROR'
  if (status === 503 || msg.includes('503') || msg.includes('service unavailable')) return 'TEMPORARY_AI_ERROR'

  // Network / connection errors
  const code = err && err.code ? String(err.code) : ''
  const networkCodes = ['ecancelled','ecanceled','econnreset','enotfound','etimedout','econnrefused','eai_again']
  if (networkCodes.includes(code.toLowerCase()) || msg.includes('network') || msg.includes('connect') || msg.includes('timeout')) return 'NETWORK_ERROR'

  return null
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function generateWithRetry({ apiKey, model, contents, config }) {
  if (!apiKey || !apiKey.trim()) {
    const e = new Error('GEMINI_API_KEY is missing')
    e.code = 'AI_SERVICE_ERROR'
    throw e
  }

  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey })

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({ model, contents, config })
      return response
    } catch (err) {
      const category = isTemporaryStatus(err)

      if (category && attempt < MAX_ATTEMPTS) {
        // Log a concise retry note (do not log sensitive inputs)
        console.warn(`Gemini request failed with ${category}. Retrying attempt ${attempt + 1}/${MAX_ATTEMPTS}.`)
        // exponential backoff: 1s, 2s
        const delay = 1000 * Math.pow(2, attempt - 1)
        await sleep(delay)
        continue
      }

      const out = new Error('AI service request failed')
      out.code = category || 'AI_SERVICE_ERROR'
      // keep a short internal message for debugging but do not expose in responses
      out.internalMessage = err && err.message ? String(err.message) : ''
      throw out
    }
  }
}

module.exports = {
  generateWithRetry,
}

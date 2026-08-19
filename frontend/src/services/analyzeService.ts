export interface AnalyzeResult {
  problem: string
  category: string
  summary: string
  possible_rights: string[]
  recommended_actions: string[]
  required_documents: string[]
  next_steps: string[]
  sources: string[]
  disclaimer: string
}

interface AnalyzeApiResponse {
  success: boolean
  data?: AnalyzeResult
  message?: string
}

import { FetchTimeoutError, fetchWithTimeout } from './fetchWithTimeout'
import { API_BASE_URL } from './api'

export async function analyzeProblem(problem: string, language: 'en' | 'hi' = 'en'): Promise<AnalyzeResult> {
  const trimmedProblem = problem.trim()

  let response: Response
  try {
    response = await fetchWithTimeout(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: trimmedProblem, language }),
    })
  } catch (err) {
    if (err instanceof FetchTimeoutError) throw err
    throw new Error('Unable to connect to CivicAI. Please make sure the backend is running.')
  }

  let payload: AnalyzeApiResponse
  try {
    payload = (await response.json()) as AnalyzeApiResponse
  } catch {
    throw new Error('Something went wrong. Please try again.')
  }

  if (!response.ok || !payload.success || !payload.data) {
    const msg = payload && payload.message ? payload.message : 'Something went wrong. Please try again.'
    throw new Error(msg)
  }

  return payload.data
}

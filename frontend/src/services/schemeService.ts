export interface SchemeMatch {
  id: string
  name: string
  description: string
  whyRelevant: string
  eligibility: string[]
  benefits: string
  nextSteps: string
  officialSource: string
}

import { FetchTimeoutError, fetchWithTimeout } from './fetchWithTimeout'
import { API_BASE_URL } from './api'

interface SchemesApiResponse {
  success: boolean
  data?: { matches: SchemeMatch[] }
  message?: string
}

export async function findSchemes(
  profile: {
    state: string
    age: number
    education: string
    income: number
    category: string
    occupation: string
  },
  language: 'en' | 'hi' = 'en',
): Promise<SchemeMatch[]> {
  const body = { ...profile, language }


  let response: Response
  try {
    response = await fetchWithTimeout(`${API_BASE_URL}/schemes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    if (err instanceof FetchTimeoutError) throw err
    throw new Error('Unable to connect to CivicAI. Please make sure the backend is running.')
  }

  let parsed: SchemesApiResponse
  try {
    parsed = (await response.json()) as SchemesApiResponse
  } catch (_) {
    throw new Error('Something went wrong. Please try again.')
  }

  if (!response.ok || !parsed.success || !parsed.data) {
    const msg = parsed && parsed.message ? parsed.message : 'Unable to find schemes right now.'
    throw new Error(msg)
  }

  return parsed.data.matches
}

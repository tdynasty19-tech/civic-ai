export interface DraftResult {
  documentType: string
  title: string
  recipient: string
  subject: string
  content: string
  disclaimer: string
}

import { FetchTimeoutError, fetchWithTimeout } from './fetchWithTimeout'

interface DraftApiResponse {
  success: boolean
  data?: DraftResult
  message?: string
}

export async function generateDraft(payload: {
  documentType: string
  recipient: string
  problem: string
  additionalDetails?: string
  language?: 'en' | 'hi'
}): Promise<DraftResult> {
  const body = {
    documentType: payload.documentType,
    recipient: payload.recipient,
    problem: payload.problem.trim(),
    additionalDetails: payload.additionalDetails ? payload.additionalDetails.trim() : '',
    language: payload.language || 'en',
  }

  let response: Response
  try {
    response = await fetchWithTimeout('http://localhost:8000/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    if (err instanceof FetchTimeoutError) throw err
    throw new Error('Unable to connect to CivicAI. Please make sure the backend is running.')
  }

  let parsed: DraftApiResponse
  try {
    parsed = (await response.json()) as DraftApiResponse
  } catch (_) {
    throw new Error('Something went wrong. Please try again.')
  }

  if (!response.ok || !parsed.success || !parsed.data) {
    const msg = parsed && parsed.message ? parsed.message : 'Unable to generate draft right now.'
    throw new Error(msg)
  }

  return parsed.data
}

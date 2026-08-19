const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    problem: { type: 'STRING' },
    category: { type: 'STRING' },
    summary: { type: 'STRING' },
    possible_rights: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    recommended_actions: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    required_documents: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    next_steps: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    sources: {
      type: 'ARRAY',
      items: { type: 'STRING' },
    },
    disclaimer: { type: 'STRING' },
  },
  required: [
    'problem',
    'category',
    'summary',
    'possible_rights',
    'recommended_actions',
    'required_documents',
    'next_steps',
    'sources',
    'disclaimer',
  ],
};

const normalizeAiResult = (problem, parsedResult) => {
  const fallbackDisclaimer =
    'This guidance is for informational purposes only. Important information should be verified with official sources or a qualified professional.';

  const safeArray = (value) => {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === 'string');
    }
    return [];
  };

  return {
    problem: typeof parsedResult?.problem === 'string' ? parsedResult.problem : problem,
    category: typeof parsedResult?.category === 'string' ? parsedResult.category : 'General civic issue',
    summary: typeof parsedResult?.summary === 'string' ? parsedResult.summary : 'No summary available.',
    possible_rights: safeArray(parsedResult?.possible_rights),
    recommended_actions: safeArray(parsedResult?.recommended_actions),
    required_documents: safeArray(parsedResult?.required_documents),
    next_steps: safeArray(parsedResult?.next_steps),
    sources: safeArray(parsedResult?.sources),
    disclaimer:
      typeof parsedResult?.disclaimer === 'string' && parsedResult.disclaimer.trim()
        ? parsedResult.disclaimer
        : fallbackDisclaimer,
  };
};

const analyzeProblem = async (problem, language = 'en') => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is missing. Please configure the environment variable on the server before using the Rights Navigator.');
  }

  try {
    const { generateWithRetry } = require('./geminiHelper')
    const languageInstruction =
      language === 'hi'
        ? 'Generate all user-facing explanatory content in Hindi using clear, natural Devanagari Hindi that is easy for ordinary citizens to understand.'
        : 'Generate all user-facing explanatory content in English.'

    const prompt = `You are CivicAI, a civic information assistant designed to help Indian citizens understand complicated civic, legal, and government-related situations.\n\n${languageInstruction}\n\nYour job is NOT to act as a lawyer.\n\nGiven the user's description:\n1. Identify the general category of the issue.\n2. Summarize the user's situation in simple language.\n3. Explain potentially relevant rights or areas of law at a high level.\n4. Give practical and safe next steps.\n5. List documents the user may want to collect.\n6. Suggest what the user could do next.\n7. Provide sources only when you can identify them with reasonable confidence.\n8. NEVER invent laws, sections, government schemes, URLs, case numbers, or official sources.\n9. If you are uncertain about a legal claim, explicitly indicate that the information should be verified through an official source or qualified professional.\n10. Do not make definitive statements such as "you will win the case".\n11. Do not impersonate a lawyer, judge, government official, or authority.\n12. For emergencies or situations involving immediate danger, tell the user to contact appropriate emergency/local authorities rather than attempting to handle the emergency.\n13. Use Indian context when relevant.\n14. Keep the explanation understandable to a normal citizen.\n15. Avoid unnecessarily complicated legal terminology.\n16. The final disclaimer must clearly state that the output is informational AI-generated guidance and important information should be verified with official sources or a qualified professional.\n\nDo not hallucinate sources.\n\nIf reliable sources cannot be provided in this phase, return an empty sources array.\n\nUser problem: ${problem}`;

    const response = await generateWithRetry({
      apiKey,
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    })

    const rawText = typeof response?.text === 'string' ? response.text.trim() : '';

    if (!rawText) {
      throw new Error('Gemini returned an empty response.');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (parseError) {
      const cleanedText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      parsedResult = JSON.parse(cleanedText);
    }

    return normalizeAiResult(problem, parsedResult);
  } catch (error) {
    // Preserve categorized errors from the Gemini helper
    if (error && error.code) {
      const e = new Error('AI analysis failed')
      e.code = error.code
      throw e
    }

    const message = error && error.message ? error.message : 'Gemini AI request failed.'
    const e = new Error(`AI analysis failed: ${message}`)
    e.code = 'AI_SERVICE_ERROR'
    throw e
  }
};

module.exports = {
  analyzeProblem,
};

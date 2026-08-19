const { analyzeProblem } = require('../services/aiService');
const { validateLanguage, unsupportedMessage } = require('../utils/language');

const validateProblem = (problem) => {
  if (typeof problem !== 'string') {
    return 'Problem must be a string.';
  }

  const trimmedProblem = problem.trim();

  if (!trimmedProblem) {
    return 'Problem cannot be empty.';
  }

  if (trimmedProblem.length < 10) {
    return 'Problem must be at least 10 characters long.';
  }

  return null;
};

const analyzeController = async (req, res) => {
  try {
    if (!req || !req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Request body is required.',
      });
    }

    const { problem, language } = req.body;
    const validationError = validateProblem(problem);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const langCheck = validateLanguage(language)
    if (!langCheck.ok) {
      return res.status(400).json({ success: false, message: unsupportedMessage() })
    }

    const trimmedProblem = problem.trim();
    const result = await analyzeProblem(trimmedProblem, langCheck.code);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Map internal error codes to user-facing messages
    const code = error && error.code ? error.code : null

    if (code === 'RATE_LIMIT_ERROR') {
      return res.status(429).json({ success: false, message: 'AI usage is temporarily limited. Please try again shortly.' })
    }

    if (code === 'TEMPORARY_AI_ERROR') {
      return res.status(503).json({ success: false, message: 'AI service is temporarily busy. Please try again in a moment.' })
    }

    if (code === 'NETWORK_ERROR') {
      return res.status(503).json({ success: false, message: 'Unable to connect to the AI service. Please try again.' })
    }

    // Fallback for other errors
    return res.status(503).json({ success: false, message: 'AI analysis is temporarily unavailable. Please try again later.' })
  }
};

module.exports = {
  analyzeController,
};

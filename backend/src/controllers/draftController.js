const { generateDraft } = require('../services/draftService');
const { validateLanguage, unsupportedMessage } = require('../utils/language');

const SUPPORTED_TYPES = [
  'Complaint',
  'Formal Request',
  'RTI Application',
  'Grievance Letter',
  'Application Letter',
];

const validateInput = (body) => {
  if (!body || typeof body !== 'object') {
    return 'Request body is required.';
  }

  const { documentType, recipient, problem, additionalDetails } = body;

  if (typeof documentType !== 'string' || !documentType.trim()) {
    return 'documentType must be a non-empty string.';
  }

  if (!SUPPORTED_TYPES.includes(documentType.trim())) {
    return `Unsupported documentType. Supported types: ${SUPPORTED_TYPES.join(', ')}.`;
  }

  if (typeof recipient !== 'string' || !recipient.trim()) {
    return 'recipient must be a non-empty string.';
  }

  if (typeof problem !== 'string' || !problem.trim()) {
    return 'problem must be a non-empty string.';
  }

  if (problem.trim().length < 10) {
    return 'problem must be at least 10 characters long.';
  }

  if (additionalDetails !== undefined && typeof additionalDetails !== 'string') {
    return 'additionalDetails must be a string when provided.';
  }

  return null;
};

const draftController = async (req, res) => {
  try {
    const validationError = validateInput(req.body);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { documentType, recipient, problem, additionalDetails, language } = req.body;

    const langCheck = validateLanguage(language)
    if (!langCheck.ok) {
      return res.status(400).json({ success: false, message: unsupportedMessage() })
    }

    const result = await generateDraft({
      documentType: documentType.trim(),
      recipient: recipient.trim(),
      problem: problem.trim(),
      additionalDetails: additionalDetails ? additionalDetails.trim() : '',
      language: langCheck.code,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
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

    return res.status(503).json({ success: false, message: 'AI analysis is temporarily unavailable. Please try again later.' })
  }
};

module.exports = {
  draftController,
};

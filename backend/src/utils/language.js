const SUPPORTED_LANGUAGES = ['en', 'hi']

const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi',
}

function validateLanguage(lang) {
  if (!lang) return { ok: true, code: 'en' }
  if (typeof lang !== 'string') return { ok: false }
  const code = lang.trim().toLowerCase()
  if (SUPPORTED_LANGUAGES.includes(code)) {
    return { ok: true, code }
  }
  return { ok: false }
}

function unsupportedMessage() {
  return `Unsupported language. Supported languages are ${LANGUAGE_NAMES.en} and ${LANGUAGE_NAMES.hi}.`
}

module.exports = {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  validateLanguage,
  unsupportedMessage,
}

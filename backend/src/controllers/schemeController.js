const { findRelevantSchemes } = require('../services/schemeService');
const { validateLanguage, unsupportedMessage } = require('../utils/language');

const validateProfile = (body) => {
  if (!body || typeof body !== 'object') return 'Request body is required.';

  const { state, age, education, income, category, occupation } = body;

  if (typeof state !== 'string' || !state.trim()) return 'state must be a non-empty string.';

  if (typeof age !== 'number' || !Number.isInteger(age) || age < 1 || age > 120)
    return 'age must be an integer between 1 and 120.';

  if (typeof education !== 'string' || !education.trim()) return 'education must be a non-empty string.';

  if (typeof income !== 'number' || Number.isNaN(income) || income < 0) return 'income must be a number >= 0.';

  if (typeof category !== 'string' || !category.trim()) return 'category must be a non-empty string.';

  if (typeof occupation !== 'string' || !occupation.trim()) return 'occupation must be a non-empty string.';

  return null;
};

const schemeController = async (req, res) => {
  try {
    const error = validateProfile(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const profile = {
      state: req.body.state.trim(),
      age: req.body.age,
      education: req.body.education.trim(),
      income: req.body.income,
      category: req.body.category.trim(),
      occupation: req.body.occupation.trim(),
    };

    const { language } = req.body
    const langCheck = validateLanguage(language)
    if (!langCheck.ok) {
      return res.status(400).json({ success: false, message: unsupportedMessage() })
    }

    const matches = await findRelevantSchemes(profile, langCheck.code);

    return res.status(200).json({ success: true, data: { matches } });
  } catch (err) {
    const message = err && err.message ? err.message : 'Unable to find schemes right now.';
    return res.status(500).json({ success: false, message });
  }
};

module.exports = {
  schemeController,
};

const schemes = require('../data/schemes');

const matchesForProfile = (profile) => {
  const { state, age, education, income, category, occupation } = profile;

  const scoreScheme = (scheme) => {
    let score = 0;

    // State match (if scheme lists states, prefer those that include user's state)
    if (Array.isArray(scheme.states) && scheme.states.length > 0) {
      if (scheme.states.map((s) => s.toLowerCase()).includes(String(state || '').toLowerCase())) {
        score += 3;
      }
    } else {
      // No state restriction - small boost
      score += 1;
    }

    // Age compatibility
    if (typeof age === 'number' && !Number.isNaN(age)) {
      if (scheme.minAge !== null && scheme.minAge !== undefined && age >= scheme.minAge) score += 2;
      if (scheme.maxAge !== null && scheme.maxAge !== undefined && age <= scheme.maxAge) score += 2;
    }

    // Education relevance
    if (Array.isArray(scheme.education) && scheme.education.length > 0) {
      if (scheme.education.map((e) => e.toLowerCase()).includes(String(education || '').toLowerCase())) {
        score += 2;
      }
    }

    // Occupation relevance
    if (Array.isArray(scheme.occupations) && scheme.occupations.length > 0) {
      if (scheme.occupations.map((o) => o.toLowerCase()).includes(String(occupation || '').toLowerCase())) {
        score += 3;
      }
    }

    // Income relevance
    if (typeof scheme.incomeLimit === 'number') {
      if (typeof income === 'number' && income <= scheme.incomeLimit) {
        score += 2;
      }
    } else {
      // No income limit specified; small neutral boost
      score += 0.5;
    }

    // Category match
    if (Array.isArray(scheme.categories) && scheme.categories.length > 0) {
      if (scheme.categories.map((c) => c.toLowerCase()).includes(String(category || '').toLowerCase())) {
        score += 2;
      }
    }

    return score;
  };

  const scored = schemes.map((s) => ({ scheme: s, score: scoreScheme(s) }));

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 5).filter((item) => item.score > 0);

  return top.map((item) => item.scheme);
};

const formatEligibility = (scheme) => {
  const elig = [];
  if (scheme.minAge !== null && scheme.minAge !== undefined) {
    elig.push(`Minimum age: ${scheme.minAge}`);
  }
  if (scheme.maxAge !== null && scheme.maxAge !== undefined) {
    elig.push(`Maximum age: ${scheme.maxAge}`);
  }
  if (Array.isArray(scheme.education) && scheme.education.length > 0) {
    elig.push(`Education: ${scheme.education.join(', ')}`);
  }
  if (Array.isArray(scheme.occupations) && scheme.occupations.length > 0) {
    elig.push(`Occupations: ${scheme.occupations.join(', ')}`);
  }
  if (typeof scheme.incomeLimit === 'number') {
    elig.push(`Income limit (upper): ${scheme.incomeLimit}`);
  }
  if (Array.isArray(scheme.states) && scheme.states.length > 0) {
    elig.push(`States: ${scheme.states.join(', ')}`);
  }
  return elig;
};

const simpleWhyRelevant = (scheme, profile) => {
  const reasons = [];
  if (Array.isArray(scheme.states) && scheme.states.length > 0 && profile.state) {
    if (scheme.states.map((s) => s.toLowerCase()).includes(String(profile.state).toLowerCase())) {
      reasons.push('Available in your state.');
    }
  }
  if (scheme.minAge && typeof profile.age === 'number' && profile.age >= scheme.minAge) {
    reasons.push(`Your age meets the minimum age requirement (${scheme.minAge}+).`);
  }
  if (scheme.maxAge && typeof profile.age === 'number' && profile.age <= scheme.maxAge) {
    reasons.push(`Your age is within the upper age limit (${scheme.maxAge}).`);
  }
  if (Array.isArray(scheme.education) && scheme.education.length > 0 && profile.education) {
    if (scheme.education.map((e) => e.toLowerCase()).includes(String(profile.education).toLowerCase())) {
      reasons.push('Your education level matches schemes commonly targeted at students/learners.');
    }
  }
  if (Array.isArray(scheme.occupations) && scheme.occupations.length > 0 && profile.occupation) {
    if (scheme.occupations.map((o) => o.toLowerCase()).includes(String(profile.occupation).toLowerCase())) {
      reasons.push('Your occupation matches groups often supported by this scheme.');
    }
  }
  if (typeof scheme.incomeLimit === 'number' && typeof profile.income === 'number') {
    if (profile.income <= scheme.incomeLimit) {
      reasons.push('Your income is within the scheme income limit.');
    }
  }

  if (reasons.length === 0) {
    return 'This scheme may be relevant based on one or more profile attributes; please verify official eligibility.';
  }

  return reasons.join(' ');
};

const findRelevantSchemes = async (profile, language = 'en') => {
  const matched = matchesForProfile(profile);

  const translate = (text) => text

  const translateReasonToHindi = (reason) => {
    // Simple phrase mappings for the generated reasons. Keep short and conservative.
    return reason
      .replace('Available in your state.', 'आपके राज्य में उपलब्ध है।')
      .replace(/Your age meets the minimum age requirement \((\d+)\+\)\./g, 'आपकी आयु न्यूनतम आयु आवश्यकता पूरी करती है ($1+)।')
      .replace(/Your age is within the upper age limit \((\d+)\)\./g, 'आपकी आयु अधिकतम आयु सीमा के भीतर है ($1)।')
      .replace('Your education level matches schemes commonly targeted at students/learners.', 'आपकी शिक्षा स्तर उन योजनाओं से मेल खाती है जो छात्रों/शिक्षार्थियों को लक्षित करती हैं।')
      .replace('Your occupation matches groups often supported by this scheme.', 'आपका पेशा उन समूहों से मेल खाता है जिन्हें यह योजना अक्सर समर्थन करती है।')
      .replace('Your income is within the scheme income limit.', 'आपकी आय योजना की आय सीमा के भीतर है।')
      .replace('This scheme may be relevant based on one or more profile attributes; please verify official eligibility.', 'यह योजना आपके दिए गए प्रोफ़ाइल के आधार पर प्रासंगिक हो सकती है; कृपया आधिकारिक योग्यता सत्यापित करें।')
  }

  const results = matched.map((s) => {
    const why = simpleWhyRelevant(s, profile)
    const whyLocalized = language === 'hi' ? translateReasonToHindi(why) : why

    return {
      id: s.id,
      name: s.name,
      description: s.description,
      whyRelevant: whyLocalized,
      eligibility: formatEligibility(s),
      benefits: s.benefits,
      nextSteps: language === 'hi' ? 'आवेदन करने से पहले आधिकारिक स्रोत पर वर्तमान योग्यता और आवेदन प्रक्रिया की पुष्टि करें।' : 'Check the official source and verify current eligibility and application process before applying.',
      officialSource: s.officialSource,
    }
  })

  return results
}

module.exports = {
  findRelevantSchemes,
};

// Curated small dataset of Indian government schemes for MVP
// Do not treat this as definitive eligibility information. Users must verify on official sites.

module.exports = [
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description:
      'Income support scheme for eligible landholding farmer families to provide direct income support.',
    states: [],
    minAge: null,
    maxAge: null,
    education: [],
    occupations: ['Farmer', 'Agriculture'],
    incomeLimit: null,
    categories: ['Rural', 'Agriculture'],
    benefits: 'Periodic direct income support to eligible farmer families.',
    officialSource: 'https://pmkisan.gov.in',
  },

  {
    id: 'pmjay-ayushman-bharat',
    name: 'Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    description:
      'Health insurance scheme that provides health coverage to eligible households for secondary and tertiary care hospitalization.',
    states: [],
    minAge: null,
    maxAge: null,
    education: [],
    occupations: [],
    incomeLimit: null,
    categories: ['Health', 'Social'],
    benefits: 'Health coverage for hospitalization expenses for eligible families.',
    officialSource: 'https://pmjay.gov.in',
  },

  {
    id: 'pmay',
    name: 'Pradhan Mantri Awas Yojana (PMAY)',
    description:
      'Mission to provide affordable housing to urban and rural poor through various beneficiary-led and area-based schemes.',
    states: [],
    minAge: 18,
    maxAge: null,
    education: [],
    occupations: [],
    incomeLimit: null,
    categories: ['Housing', 'Urban', 'Rural'],
    benefits: 'Assistance and subsidies for affordable housing to eligible beneficiaries.',
    officialSource: 'https://pmaymis.gov.in',
  },

  {
    id: 'nsp-scholarships',
    name: 'National Scholarship Portal (various scholarships)',
    description:
      'Gateway for various government scholarship schemes for students across educational levels administered through NSP.',
    states: [],
    minAge: null,
    maxAge: null,
    education: ['Undergraduate', 'Postgraduate', 'School'],
    occupations: ['Student'],
    incomeLimit: null,
    categories: ['Education', 'Students'],
    benefits: 'Scholarships and financial assistance for eligible students.',
    officialSource: 'https://scholarships.gov.in',
  },

  {
    id: 'pm-svanidhi',
    name: 'PM SVANidhi (Street Vendors AtmaNirbhar Nidhi)',
    description:
      'Micro-credit scheme to provide affordable working capital loan to street vendors to support their livelihoods.',
    states: [],
    minAge: 18,
    maxAge: null,
    education: [],
    occupations: ['Street Vendor', 'Vendor'],
    incomeLimit: null,
    categories: ['Microcredit', 'Livelihood'],
    benefits: 'Collateral-free micro-credit and working capital support for street vendors.',
    officialSource: 'https://pmsvanidhi.mohua.gov.in',
  },

  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana',
    description:
      'Small savings scheme for the benefit of the girl child, offering attractive interest rates and tax benefits.',
    states: [],
    minAge: null,
    maxAge: null,
    education: [],
    occupations: [],
    incomeLimit: null,
    categories: ['Savings', 'Children', 'Women'],
    benefits: 'Long-term savings scheme targeted at the girl child with tax benefits.',
    officialSource: 'https://www.india.gov.in/',
  },

  {
    id: 'mgnrega',
    name: 'MGNREGA (Mahatma Gandhi National Rural Employment Guarantee Act)',
    description:
      'Rural employment guarantee scheme that aims to provide at least 100 days of wage employment to rural households.',
    states: [],
    minAge: 18,
    maxAge: null,
    education: [],
    occupations: [],
    incomeLimit: null,
    categories: ['Employment', 'Rural'],
    benefits: 'Wage employment and livelihood support for rural households.',
    officialSource: 'https://nrega.nic.in',
  },
]

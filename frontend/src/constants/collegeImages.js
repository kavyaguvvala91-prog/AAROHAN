const normalizeCollegeName = (name = '') =>
  name
    .toLowerCase()
    .replace(/\d+/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const WIKIMEDIA_FILE_BASE = 'https://commons.wikimedia.org/wiki/Special:FilePath/';

const realCollegeImages = [
  {
    match: ['iit hyderabad'],
    image: `${WIKIMEDIA_FILE_BASE}IIT(Hyderabad).jpg`,
  },
  {
    match: ['nit warangal'],
    image: `${WIKIMEDIA_FILE_BASE}NITwarangal.jpg`,
  },
  {
    match: ['iiit hyderabad'],
    image: `${WIKIMEDIA_FILE_BASE}IIIT%20hyderabad%20view.jpg`,
  },
  {
    match: ['bits hyderabad', 'bits pilani hyderabad'],
    image: `${WIKIMEDIA_FILE_BASE}BITS%20Pilani%20-%20Hyderabad%20campus.jpg`,
  },
  {
    match: ['osmania university'],
    image: `${WIKIMEDIA_FILE_BASE}Osmania%20University%20(46838).jpg`,
  },
  {
    match: ['aiims bibinagar'],
    image: `${WIKIMEDIA_FILE_BASE}AIIMS,%20Bibinagar.jpg`,
  },
  {
    match: ['nalsar university of law'],
    image: `${WIKIMEDIA_FILE_BASE}Nalsar%20acad%20entrance.jpeg`,
  },
];

export const getCollegeImage = (college = {}) => {
  const normalizedName = normalizeCollegeName(college.name);
  const matchedCollege = realCollegeImages.find(({ match }) =>
    match.some((candidate) => normalizedName.includes(candidate))
  );

  if (matchedCollege) {
    return matchedCollege.image;
  }

  return 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80';
};

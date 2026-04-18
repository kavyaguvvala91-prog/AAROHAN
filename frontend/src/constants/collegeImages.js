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
  {
    match: ['cvr college', 'cvr college of engineering'],
    image: `${WIKIMEDIA_FILE_BASE}CVR%20College%20Mainblock.jpg`,
  },
  {
    match: ['vnr vjiet', 'vnr vignana jyothi', 'vnr vignana jyothi institute of engineering and technology'],
    image: `${WIKIMEDIA_FILE_BASE}VNR%20VJIET%202.jpg`,
  },
  {
    match: ['mgit', 'mahatma gandhi institute of technology'],
    image: `${WIKIMEDIA_FILE_BASE}Mahatma%20Gandhi%20Institute%20of%20Technology.jpg`,
  },
  {
    match: ['cbit', 'chaitanya bharathi institute of technology'],
    image: `${WIKIMEDIA_FILE_BASE}Main%20Entrance%20CBIT.png`,
  },
  {
    match: ['osmania medical college'],
    image: `${WIKIMEDIA_FILE_BASE}Osmania%20medical%20college.JPG`,
  },
  {
    match: ['gandhi medical college'],
    image: `${WIKIMEDIA_FILE_BASE}Gandhi%20Medical%20College.jpg`,
  },
  {
    match: ['kakatiya medical college'],
    image: `${WIKIMEDIA_FILE_BASE}KMC%20building%20cropped.jpg`,
  },
  {
    match: ['vaagdevi college of engineering', 'vaagdevi engineering college'],
    image: `${WIKIMEDIA_FILE_BASE}Vaagdevi%20College%20of%20Engineering%20building.jpg`,
  },
  {
    match: ['vardhaman college of engineering'],
    image: `${WIKIMEDIA_FILE_BASE}Vardhaman%20College%20of%20Engineering.JPG`,
  },
];

const typeFallbackImages = {
  engineering: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
  polytechnic: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  medical: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
  law: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
};

export const getCollegeImage = (college = {}) => {
  const normalizedName = normalizeCollegeName(college.name);
  const matchedCollege = realCollegeImages.find(({ match }) =>
    match.some((candidate) => normalizedName.includes(candidate))
  );

  if (matchedCollege) {
    return matchedCollege.image;
  }

  const normalizedType = normalizeCollegeName(college.type);
  return typeFallbackImages[normalizedType] || typeFallbackImages.engineering;
};

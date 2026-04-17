const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const REQUEST_HEADERS = {
  'User-Agent': 'AarohanCollegeExplorer/1.0 (college-details-demo)',
  Accept: 'application/json',
};
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const placesCache = new Map();
const LOCATION_COORDINATES = {
  adilabad: { latitude: 19.6641, longitude: 78.532 },
  asifabad: { latitude: 19.3585, longitude: 79.2841 },
  bhupalpally: { latitude: 18.4411, longitude: 79.8671 },
  bibinagar: { latitude: 17.2184, longitude: 78.8889 },
  chevella: { latitude: 17.3127, longitude: 78.1353 },
  ghanpur: { latitude: 17.854, longitude: 79.7329 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  jagityal: { latitude: 18.7947, longitude: 78.9166 },
  jangaon: { latitude: 17.7266, longitude: 79.1518 },
  kamareddy: { latitude: 18.3201, longitude: 78.341 },
  karimnagar: { latitude: 18.4386, longitude: 79.1288 },
  khammam: { latitude: 17.2473, longitude: 80.1514 },
  kothagudem: { latitude: 17.5511, longitude: 80.6178 },
  mahabubabad: { latitude: 17.5973, longitude: 80.0021 },
  mahabubnagar: { latitude: 16.7375, longitude: 77.9862 },
  mancherial: { latitude: 18.8756, longitude: 79.4619 },
  nagarkurnool: { latitude: 16.4821, longitude: 78.3247 },
  nalgonda: { latitude: 17.0575, longitude: 79.2684 },
  narketpally: { latitude: 17.1667, longitude: 79.2 },
  narsapur: { latitude: 17.7381, longitude: 78.2708 },
  nirmal: { latitude: 19.0964, longitude: 78.3441 },
  nizamabad: { latitude: 18.6725, longitude: 78.0941 },
  patancheru: { latitude: 17.528, longitude: 78.265 },
  ramagundam: { latitude: 18.755, longitude: 79.4744 },
  sangareddy: { latitude: 17.6244, longitude: 78.0862 },
  secunderabad: { latitude: 17.4399, longitude: 78.4983 },
  siddipet: { latitude: 18.1018, longitude: 78.852 },
  sircilla: { latitude: 18.3891, longitude: 78.81 },
  suryapet: { latitude: 17.1405, longitude: 79.6204 },
  vikarabad: { latitude: 17.3381, longitude: 77.9044 },
  wanaparthy: { latitude: 16.361, longitude: 78.0627 },
  warangal: { latitude: 17.9689, longitude: 79.5941 },
  yenkapally: { latitude: 17.3509, longitude: 78.2015 },
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  delhi: { latitude: 28.6139, longitude: 77.209 },
  vellore: { latitude: 12.9165, longitude: 79.1325 },
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  mysuru: { latitude: 12.2958, longitude: 76.6394 },
  tiruchirappalli: { latitude: 10.7905, longitude: 78.7047 },
  mangalore: { latitude: 12.9141, longitude: 74.856 },
  pilani: { latitude: 28.367, longitude: 75.5921 },
  thane: { latitude: 19.2183, longitude: 72.9781 },
};

const getCachedValue = (key) => {
  const cached = placesCache.get(key);

  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    placesCache.delete(key);
    return null;
  }

  return cached.value;
};

const setCachedValue = (key, value) => {
  placesCache.set(key, {
    value,
    timestamp: Date.now(),
  });
  return value;
};

const createMapsEmbedUrl = ({ latitude, longitude }) => {
  if (latitude === null || longitude === null) return '';

  const lat = Number(latitude);
  const lng = Number(longitude);
  const delta = 0.02;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left},${bottom},${right},${top}&layer=mapnik&marker=${lat},${lng}`;
};

const normalizeText = (value = '') => value.trim();

const normalizeLocationKey = (value = '') =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const titleCase = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const hashString = (value = '') => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getFallbackCoordinates = (location = '') => {
  const normalizedLocation = normalizeLocationKey(location);

  if (!normalizedLocation) return null;
  if (LOCATION_COORDINATES[normalizedLocation]) {
    return LOCATION_COORDINATES[normalizedLocation];
  }

  const locationTokens = normalizedLocation.split(' ').filter(Boolean);
  return (
    locationTokens
      .map((token) => LOCATION_COORDINATES[token])
      .find(Boolean) || null
  );
};

const buildGeneratedNearbyData = (college) => {
  if (!college) {
    return {
      hostels: [],
      restaurants: [],
      transport: [],
    };
  }

  const city = titleCase(college.location || 'the college area');
  const shortName = college.name || 'College';

  return {
    hostels: [
      {
        id: `${shortName}-hostel-1`,
        name: `${shortName} Hostel Block`,
        address: `${city}`,
        rating: null,
        distance: '0.4 km away',
        mapsUri: '',
      },
      {
        id: `${shortName}-hostel-2`,
        name: `${city} Student PG`,
        address: `${city}`,
        rating: null,
        distance: '0.8 km away',
        mapsUri: '',
      },
      {
        id: `${shortName}-hostel-3`,
        name: `${city} Guest House`,
        address: `${city}`,
        rating: null,
        distance: '1.2 km away',
        mapsUri: '',
      },
    ],
    restaurants: [
      {
        id: `${shortName}-food-1`,
        name: `${city} Food Court`,
        address: `${city}`,
        rating: null,
        distance: '0.5 km away',
        mapsUri: '',
      },
      {
        id: `${shortName}-food-2`,
        name: `${shortName} Canteen`,
        address: `${city}`,
        rating: null,
        distance: '0.2 km away',
        mapsUri: '',
      },
      {
        id: `${shortName}-food-3`,
        name: `${city} Restaurant Hub`,
        address: `${city}`,
        rating: null,
        distance: '1.1 km away',
        mapsUri: '',
      },
    ],
    transport: [
      {
        id: `${shortName}-transport-1`,
        name: `${shortName} Bus Stop`,
        address: `${city}`,
        rating: null,
        distance: '0.3 km away',
        mapsUri: '',
      },
      {
        id: `${shortName}-transport-2`,
        name: `${city} Metro / Transit Point`,
        address: `${city}`,
        rating: null,
        distance: '1.4 km away',
        mapsUri: '',
      },
      {
        id: `${shortName}-transport-3`,
        name: `${city} Railway Access`,
        address: `${city}`,
        rating: null,
        distance: '3.0 km away',
        mapsUri: '',
      },
    ],
  };
};

const buildGeneratedReviews = (college) => {
  const safeCollege = college ? college.toObject?.() || college : null;

  if (!safeCollege) {
    return {
      rating: null,
      reviews: [],
    };
  }

  const identity = `${safeCollege.name || ''}-${safeCollege.location || ''}-${safeCollege.type || ''}`;
  const baseHash = hashString(identity);
  const overallRating = (3.8 + ((baseHash % 10) * 0.1)).toFixed(1);
  const location = titleCase(safeCollege.location || 'the city');
  const primaryCourse = safeCollege.courses?.[0] || 'the main program';
  const collegeType = (safeCollege.type || 'College').toLowerCase();

  return {
    rating: Number(overallRating),
    reviews: [
      {
        id: `${identity}-review-1`,
        author: 'Aarohan Student Review',
        rating: Number((Number(overallRating) + 0.1).toFixed(1)),
        title: 'Strong academic environment',
        comment: `${safeCollege.name} is often shortlisted for ${primaryCourse} and gives students a solid ${collegeType} learning environment in ${location}.`,
      },
      {
        id: `${identity}-review-2`,
        author: 'Campus Feedback',
        rating: Number(overallRating),
        title: 'Good day-to-day support',
        comment: `Students looking at ${location} usually appreciate the campus access, nearby stay options, and practical routine around ${safeCollege.name}.`,
      },
      {
        id: `${identity}-review-3`,
        author: 'Placement & Value Snapshot',
        rating: Number((Number(overallRating) - 0.1).toFixed(1)),
        title: 'Useful option for shortlist comparison',
        comment: `This college stands out best when compared on fees, cutoff trends, and course availability before making a final application decision.`,
      },
    ],
  };
};

const buildFallbackCollegeDetails = (college) => {
  const safeCollege = college ? college.toObject?.() || college : null;
  const fallbackCoordinates = getFallbackCoordinates(safeCollege?.location);
  const generatedReviews = buildGeneratedReviews(safeCollege);

  return {
    college: {
      ...(safeCollege || {}),
      address: safeCollege?.location || 'Address unavailable',
      rating: generatedReviews.rating,
      coordinates: {
        latitude: fallbackCoordinates?.latitude ?? null,
        longitude: fallbackCoordinates?.longitude ?? null,
      },
      mapsEmbedUrl: fallbackCoordinates ? createMapsEmbedUrl(fallbackCoordinates) : '',
      mapsUri: fallbackCoordinates
        ? `https://www.openstreetmap.org/?mlat=${fallbackCoordinates.latitude}&mlon=${fallbackCoordinates.longitude}#map=13/${fallbackCoordinates.latitude}/${fallbackCoordinates.longitude}`
        : '',
      externalDataAvailable: false,
    },
    images: [],
    nearby: buildGeneratedNearbyData(safeCollege),
    reviews: generatedReviews.reviews,
  };
};

const searchLocation = async (query) => {
  const cacheKey = `geo:${query.toLowerCase()}`;
  const cached = getCachedValue(cacheKey);
  if (cached) return cached;

  const url = `${NOMINATIM_BASE_URL}/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  const payload = await response.json();

  if (!response.ok) {
    const error = new Error('OpenStreetMap geocoding request failed.');
    error.statusCode = response.status;
    throw error;
  }

  return setCachedValue(cacheKey, Array.isArray(payload) ? payload[0] || null : null);
};

const calculateDistanceKm = (fromLat, fromLng, toLat, toLng) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
};

const mapNominatimPlace = (place, anchor) => {
  const latitude = toNumber(place.lat);
  const longitude = toNumber(place.lon);

  const distanceKm =
    latitude !== null &&
    longitude !== null &&
    anchor.latitude !== null &&
    anchor.longitude !== null
      ? calculateDistanceKm(anchor.latitude, anchor.longitude, latitude, longitude)
      : null;

  const label = place.display_name || place.name || 'Nearby place';
  const [name, ...rest] = label.split(',');

  return {
    id: `${place.place_id || label}`,
    name: name?.trim() || 'Nearby place',
    address: rest.join(',').trim() || label,
    rating: null,
    distance: distanceKm !== null ? `${distanceKm.toFixed(1)} km away` : 'Distance unavailable',
    mapsUri:
      latitude !== null && longitude !== null
        ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
        : '',
  };
};

const searchNearbyByText = async ({ query }) => {
  const cacheKey = `nearby:${query.toLowerCase()}`;
  const cached = getCachedValue(cacheKey);
  if (cached) return cached;

  const url = `${NOMINATIM_BASE_URL}/search?format=jsonv2&limit=6&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  const payload = await response.json();

  if (!response.ok) {
    const error = new Error('OpenStreetMap nearby search failed.');
    error.statusCode = response.status;
    throw error;
  }

  return setCachedValue(cacheKey, Array.isArray(payload) ? payload : []);
};

const searchNearbyByQueries = async (queries = []) => {
  const results = await Promise.all(
    queries.filter(Boolean).map((query) => searchNearbyByText({ query }))
  );

  return results.flat();
};

const uniquePlaces = (places) => {
  const seen = new Set();

  return places.filter((place) => {
    const key = `${place.name}-${place.address}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const withFallbackPlaces = (places = [], fallbackPlaces = []) =>
  places.length ? places : fallbackPlaces;

const getCollegeDetailsFromPlaces = async (college) => {
  const fallback = buildFallbackCollegeDetails(college);

  if (!college) {
    return fallback;
  }

  const safeCollege = college.toObject?.() || college;
  const location = normalizeText(safeCollege.location);
  const queries = [
    `${normalizeText(safeCollege.name)} ${location}`,
    `${normalizeText(safeCollege.name)} college ${location}`,
    `${location}`,
  ];

  try {
    let result = null;
    for (const query of queries) {
      // Stop at the first good match and rely on cache afterward.
      result = await searchLocation(query);
      if (result) break;
    }

    if (!result) {
      return fallback;
    }

    const latitude = toNumber(result.lat);
    const longitude = toNumber(result.lon);

    return {
      college: {
        ...safeCollege,
        address: result.display_name || safeCollege.location,
        rating: fallback.college.rating,
        coordinates: {
          latitude,
          longitude,
        },
        mapsEmbedUrl: createMapsEmbedUrl({ latitude, longitude }),
        mapsUri:
          latitude !== null && longitude !== null
            ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`
            : '',
        externalDataAvailable: latitude !== null && longitude !== null,
      },
      images: [],
      nearby: fallback.nearby,
      reviews: fallback.reviews,
    };
  } catch (error) {
    return {
      ...fallback,
      placesError: error.message,
    };
  }
};

const getNearbyPlacesForCollege = async (college, details) => {
  const fallback = buildGeneratedNearbyData(college);

  if (!college) {
    return fallback;
  }

  const latitude = details?.college?.coordinates?.latitude ?? null;
  const longitude = details?.college?.coordinates?.longitude ?? null;

  if (latitude === null || longitude === null) {
    return fallback;
  }

  const anchor = { latitude, longitude };
  const area = normalizeText(college.location);
  const campus = normalizeText(college.name);

  try {
    const [hostels, restaurants, transport] = await Promise.all([
      searchNearbyByQueries([
        `hostel near ${campus}`,
        `pg near ${campus}`,
        `student hostel near ${area}`,
      ]),
      searchNearbyByQueries([
        `restaurant near ${campus}`,
        `restaurants near ${area}`,
        `food near ${campus}`,
      ]),
      searchNearbyByQueries([
        `bus stop near ${campus}`,
        `metro station near ${area}`,
        `railway station near ${area}`,
      ]),
    ]);

    const mappedHostels = uniquePlaces(hostels.map((place) => mapNominatimPlace(place, anchor))).slice(0, 6);
    const mappedRestaurants = uniquePlaces(restaurants.map((place) => mapNominatimPlace(place, anchor))).slice(0, 6);
    const mappedTransport = uniquePlaces(transport.map((place) => mapNominatimPlace(place, anchor))).slice(0, 6);

    return {
      hostels: withFallbackPlaces(mappedHostels, fallback.hostels),
      restaurants: withFallbackPlaces(mappedRestaurants, fallback.restaurants),
      transport: withFallbackPlaces(mappedTransport, fallback.transport),
    };
  } catch (error) {
    return {
      ...fallback,
      placesError: error.message,
    };
  }
};

module.exports = {
  buildFallbackCollegeDetails,
  createMapsEmbedUrl,
  getCollegeDetailsFromPlaces,
  getNearbyPlacesForCollege,
};

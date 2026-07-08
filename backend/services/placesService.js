const {
  fetchJsonWithTimeout,
  toPositiveInteger,
} = require('./fallbackApiService');
const { env } = require('../config/env');

const GOOGLE_MAPS_API_KEY = env.googleMapsApiKey;
const GOOGLE_GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_PLACES_SEARCH_API_URL = 'https://places.googleapis.com/v1/places:searchText';
const GOOGLE_MAPS_SEARCH_BASE_URL = 'https://www.google.com/maps/search/?api=1&query=';
const EXTERNAL_API_TIMEOUT_MS = toPositiveInteger(env.externalApiTimeoutMs, 5000);
const GOOGLE_PLACES_FIELD_MASK =
  'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.googleMapsUri';
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

const hasGoogleMapsKey = Boolean(GOOGLE_MAPS_API_KEY);

const isValidCoordinatePair = (latitude, longitude) =>
  latitude !== null &&
  latitude !== undefined &&
  longitude !== null &&
  longitude !== undefined &&
  !Number.isNaN(Number(latitude)) &&
  !Number.isNaN(Number(longitude));

const buildGoogleMapsSearchUrl = (query) => {
  const safeQuery = String(query || '').trim();
  if (!safeQuery) return '';

  return `${GOOGLE_MAPS_SEARCH_BASE_URL}${encodeURIComponent(safeQuery)}`;
};

const createMapsEmbedUrl = ({ query, latitude, longitude, zoom = 15 }) => {
  const safeQuery = String(query || '').trim();

  // Use the public embed URL so the UI does not depend on the Maps Embed API key.
  if (safeQuery) {
    return `https://www.google.com/maps?q=${encodeURIComponent(safeQuery)}&output=embed`;
  }

  if (!isValidCoordinatePair(latitude, longitude)) {
    return '';
  }

  return `https://www.google.com/maps?q=${Number(latitude)},${Number(longitude)}&output=embed`;
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

const buildGooglePlacesHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
  'X-Goog-FieldMask': GOOGLE_PLACES_FIELD_MASK,
});

const normalizeGooglePlace = (place = {}) => {
  const latitude = toNumber(place.location?.latitude);
  const longitude = toNumber(place.location?.longitude);
  const displayName = String(place.displayName?.text || '').trim();
  const formattedAddress = String(place.formattedAddress || '').trim();
  const query = [displayName, formattedAddress].filter(Boolean).join(', ');

  return {
    id: place.id || query || formattedAddress || displayName || 'google-place',
    name: displayName || formattedAddress || 'Nearby place',
    address: formattedAddress || displayName || 'Address unavailable',
    latitude,
    longitude,
    googleMapsUri: place.googleMapsUri || buildGoogleMapsSearchUrl(query || formattedAddress || displayName),
  };
};

const normalizeGeocodeResult = (result = {}, fallbackLabel = '') => {
  const latitude = toNumber(result.geometry?.location?.lat);
  const longitude = toNumber(result.geometry?.location?.lng);
  const formattedAddress = String(result.formatted_address || '').trim();

  return {
    id: result.place_id || fallbackLabel || formattedAddress || 'google-geocode-result',
    name: formattedAddress || fallbackLabel || 'Nearby place',
    address: formattedAddress || fallbackLabel || 'Address unavailable',
    latitude,
    longitude,
    googleMapsUri: buildGoogleMapsSearchUrl(formattedAddress || fallbackLabel),
  };
};

const toLegacyLocationPayload = (place = {}) => ({
  place_id: place.id,
  display_name: place.address || place.name || 'Nearby place',
  name: place.name || place.address || 'Nearby place',
  lat: place.latitude,
  lon: place.longitude,
  googleMapsUri: place.googleMapsUri || buildGoogleMapsSearchUrl(place.address || place.name),
});

const searchGooglePlace = async (query, locationBias) => {
  if (!hasGoogleMapsKey || !String(query || '').trim()) {
    return null;
  }

  const payload = await fetchJsonWithTimeout(
    GOOGLE_PLACES_SEARCH_API_URL,
    {
      method: 'POST',
      headers: buildGooglePlacesHeaders(),
      body: JSON.stringify({
        textQuery: String(query).trim(),
        pageSize: 1,
        ...(locationBias ? { locationBias } : {}),
      }),
    },
    EXTERNAL_API_TIMEOUT_MS
  );

  const [firstPlace] = Array.isArray(payload?.places) ? payload.places : [];
  return firstPlace ? normalizeGooglePlace(firstPlace) : null;
};

const searchGooglePlaces = async (query, { pageSize = 6, locationBias } = {}) => {
  if (!hasGoogleMapsKey || !String(query || '').trim()) {
    return [];
  }

  const payload = await fetchJsonWithTimeout(
    GOOGLE_PLACES_SEARCH_API_URL,
    {
      method: 'POST',
      headers: buildGooglePlacesHeaders(),
      body: JSON.stringify({
        textQuery: String(query).trim(),
        pageSize,
        ...(locationBias ? { locationBias } : {}),
      }),
    },
    EXTERNAL_API_TIMEOUT_MS
  );

  return Array.isArray(payload?.places) ? payload.places.map(normalizeGooglePlace) : [];
};

const geocodeGoogleLocation = async (query) => {
  if (!hasGoogleMapsKey || !String(query || '').trim()) {
    return null;
  }

  const payload = await fetchJsonWithTimeout(
    `${GOOGLE_GEOCODING_API_URL}?address=${encodeURIComponent(query)}&key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}`,
    { headers: { Accept: 'application/json' } },
    EXTERNAL_API_TIMEOUT_MS
  );

  const [firstResult] = Array.isArray(payload?.results) ? payload.results : [];
  return firstResult ? normalizeGeocodeResult(firstResult, query) : null;
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
  const mapsQuery = [safeCollege?.name, safeCollege?.location].filter(Boolean).join(', ');
  const mapsEmbedUrl = createMapsEmbedUrl({
    query: mapsQuery,
    latitude: fallbackCoordinates?.latitude ?? null,
    longitude: fallbackCoordinates?.longitude ?? null,
    zoom: 13,
  });

  return {
    college: {
      ...(safeCollege || {}),
      address: safeCollege?.location || 'Address unavailable',
      rating: generatedReviews.rating,
      coordinates: {
        latitude: fallbackCoordinates?.latitude ?? null,
        longitude: fallbackCoordinates?.longitude ?? null,
      },
      mapsEmbedUrl,
      mapsUri: buildGoogleMapsSearchUrl(mapsQuery || safeCollege?.location || safeCollege?.name),
      externalDataAvailable: false,
    },
    images: [],
    nearby: buildGeneratedNearbyData(safeCollege),
    reviews: generatedReviews.reviews,
  };
};

const searchLocation = async (query) => {
  const safeQuery = String(query || '').trim();
  if (!safeQuery) {
    return null;
  }

  const cacheKey = `geo:${safeQuery.toLowerCase()}`;
  const cached = getCachedValue(cacheKey);
  if (cached) return cached;

  const locationBiasCoordinates = getFallbackCoordinates(safeQuery);
  const locationBias = locationBiasCoordinates
    ? {
        circle: {
          center: locationBiasCoordinates,
          radius: 50000,
        },
      }
    : undefined;

  try {
    const place = await searchGooglePlace(safeQuery, locationBias);

    if (place) {
      return setCachedValue(cacheKey, {
        data: toLegacyLocationPayload(place),
        source: 'primary',
      });
    }
  } catch (error) {
    void error;
  }

  try {
    const geocoded = await geocodeGoogleLocation(safeQuery);

    if (geocoded) {
      return setCachedValue(cacheKey, {
        data: toLegacyLocationPayload(geocoded),
        source: 'primary',
      });
    }
  } catch (error) {
    void error;
  }

  const fallbackCoordinates = getFallbackCoordinates(safeQuery);
  const fallbackResult = fallbackCoordinates
    ? {
        data: {
          place_id: safeQuery,
          display_name: safeQuery,
          name: safeQuery,
          lat: fallbackCoordinates.latitude,
          lon: fallbackCoordinates.longitude,
          googleMapsUri: buildGoogleMapsSearchUrl(safeQuery),
        },
        source: 'fallback',
      }
    : null;

  return setCachedValue(cacheKey, fallbackResult);
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

const mapGooglePlace = (place, anchor) => {
  const latitude = toNumber(place.latitude);
  const longitude = toNumber(place.longitude);

  const distanceKm =
    latitude !== null &&
    longitude !== null &&
    anchor.latitude !== null &&
    anchor.longitude !== null
      ? calculateDistanceKm(anchor.latitude, anchor.longitude, latitude, longitude)
      : null;

  const label = place.address || place.name || 'Nearby place';
  const [name, ...rest] = String(label).split(',');
  const mapsUri = place.googleMapsUri || buildGoogleMapsSearchUrl(label);

  return {
    id: `${place.id || place.place_id || label}`,
    name: name?.trim() || 'Nearby place',
    address: rest.join(',').trim() || label,
    rating: null,
    distance: distanceKm !== null ? `${distanceKm.toFixed(1)} km away` : 'Distance unavailable',
    mapsUri,
  };
};

const searchNearbyByText = async ({ query, anchor }) => {
  const safeQuery = String(query || '').trim();
  if (!safeQuery) {
    return {
      data: [],
      source: 'fallback',
    };
  }

  const cacheKey = `nearby:${safeQuery.toLowerCase()}:${anchor?.latitude ?? ''}:${anchor?.longitude ?? ''}`;
  const cached = getCachedValue(cacheKey);
  if (cached) return cached;

  try {
    const locationBias = anchor
      ? {
          circle: {
            center: anchor,
            radius: 3500,
          },
        }
      : undefined;

    const places = await searchGooglePlaces(safeQuery, {
      pageSize: 8,
      locationBias,
    });

    const result = {
      data: places.map((place) => mapGooglePlace(place, anchor || { latitude: null, longitude: null })),
      source: places.length ? 'primary' : 'fallback',
    };

    return setCachedValue(cacheKey, result);
  } catch (error) {
    return setCachedValue(cacheKey, {
      data: [],
      source: 'fallback',
      error: error.message,
    });
  }
};

const searchNearbyByQueries = async (queries = [], anchor = null) => {
  const results = await Promise.all(
    queries.filter(Boolean).map((query) => searchNearbyByText({ query, anchor }))
  );

  return {
    places: results.flatMap((result) => result.data || []),
    source: results.some((result) => result.source === 'primary') ? 'primary' : 'fallback',
  };
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
    return {
      ...fallback,
      source: 'fallback',
    };
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
    let source = 'primary';

    for (const query of queries) {
      // Stop at the first good match and rely on cache afterward.
      result = await searchLocation(query);
      if (result?.data) {
        source = result.source || 'primary';
        break;
      }
    }

    if (!result?.data) {
      return {
        ...fallback,
        source: 'fallback',
      };
    }

    const latitude = toNumber(result.data.lat);
    const longitude = toNumber(result.data.lon);

    return {
      college: {
        ...safeCollege,
        address: result.data.display_name || safeCollege.location,
        rating: fallback.college.rating,
        coordinates: {
          latitude,
          longitude,
        },
        mapsEmbedUrl: createMapsEmbedUrl({
          query: [safeCollege.name, result.data.display_name || safeCollege.location]
            .filter(Boolean)
            .join(', '),
          latitude,
          longitude,
          zoom: 15,
        }),
        mapsUri: result.data.googleMapsUri || buildGoogleMapsSearchUrl(result.data.display_name || safeCollege.location),
        externalDataAvailable: source === 'primary' && latitude !== null && longitude !== null,
      },
      images: [],
      nearby: fallback.nearby,
      reviews: fallback.reviews,
      source,
    };
  } catch (error) {
    return {
      ...fallback,
      source: 'fallback',
      placesError: error.details?.join(' | ') || error.message,
    };
  }
};

const getNearbyPlacesForCollege = async (college, details) => {
  const fallback = buildGeneratedNearbyData(college);

  if (!college) {
    return {
      ...fallback,
      source: 'fallback',
    };
  }

  const fallbackCoordinates = getFallbackCoordinates(college.location);
  const latitude = details?.college?.coordinates?.latitude ?? fallbackCoordinates?.latitude ?? null;
  const longitude = details?.college?.coordinates?.longitude ?? fallbackCoordinates?.longitude ?? null;

  if (latitude === null || longitude === null) {
    return {
      ...fallback,
      source: 'fallback',
    };
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
      ], anchor),
      searchNearbyByQueries([
        `restaurant near ${campus}`,
        `restaurants near ${area}`,
        `food near ${campus}`,
      ], anchor),
      searchNearbyByQueries([
        `bus stop near ${campus}`,
        `metro station near ${area}`,
        `railway station near ${area}`,
      ], anchor),
    ]);

    const mappedHostels = uniquePlaces(hostels.places.map((place) => mapGooglePlace(place, anchor))).slice(0, 6);
    const mappedRestaurants = uniquePlaces(restaurants.places.map((place) => mapGooglePlace(place, anchor))).slice(0, 6);
    const mappedTransport = uniquePlaces(transport.places.map((place) => mapGooglePlace(place, anchor))).slice(0, 6);

    return {
      hostels: withFallbackPlaces(mappedHostels, fallback.hostels),
      restaurants: withFallbackPlaces(mappedRestaurants, fallback.restaurants),
      transport: withFallbackPlaces(mappedTransport, fallback.transport),
      source:
        [hostels.source, restaurants.source, transport.source].some((item) => item === 'primary')
          ? 'primary'
          : 'fallback',
    };
  } catch (error) {
    return {
      ...fallback,
      source: 'fallback',
      placesError: error.details?.join(' | ') || error.message,
    };
  }
};

module.exports = {
  buildFallbackCollegeDetails,
  createMapsEmbedUrl,
  getCollegeDetailsFromPlaces,
  getNearbyPlacesForCollege,
};

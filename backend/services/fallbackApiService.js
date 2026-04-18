const DEFAULT_TIMEOUT_MS = 5000;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const createTimeoutError = (timeoutMs) => {
  const error = new Error(`External API request timed out after ${timeoutMs}ms.`);
  error.code = 'ETIMEDOUT';
  error.statusCode = 504;
  return error;
};

const fetchJsonWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (!response.ok) {
      const httpError = new Error('External API request failed.');
      httpError.statusCode = response.status;
      httpError.payload = payload;
      throw httpError;
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createTimeoutError(timeoutMs);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const resolveFallbackApiData = async ({
  primary,
  fallback,
  isEmpty = (value) => value == null,
}) => {
  const primaryError = [];

  try {
    const primaryData = await primary.request();
    if (!isEmpty(primaryData)) {
      return {
        data: primaryData,
        source: 'primary',
      };
    }

    primaryError.push(`${primary.name} returned no usable data.`);
  } catch (error) {
    primaryError.push(`${primary.name}: ${error.message}`);
  }

  try {
    const fallbackData = await fallback.request();
    if (!isEmpty(fallbackData)) {
      return {
        data: fallbackData,
        source: 'fallback',
      };
    }

    const emptyError = new Error(`${fallback.name} returned no usable data.`);
    emptyError.statusCode = 502;
    emptyError.details = primaryError;
    throw emptyError;
  } catch (error) {
    error.details = [...primaryError, `${fallback.name}: ${error.message}`];
    throw error;
  }
};

module.exports = {
  fetchJsonWithTimeout,
  resolveFallbackApiData,
  toPositiveInteger,
};

/**
 * Utility function to convert HTTP URLs to HTTPS
 * Prevents mixed content warnings when loading images on HTTPS pages
 * @param {string} url - The URL to convert
 * @returns {string} - The URL with HTTPS protocol, or original URL if already HTTPS or invalid
 */
export const ensureHttps = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  // If URL starts with http://, replace with https://
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  // Return original URL if it's already HTTPS, relative, or data URL
  return url;
};

/**
 * Utility function to safely get image URL, ensuring HTTPS
 * @param {string} url - The image URL
 * @param {string} fallback - Fallback URL if original is invalid
 * @returns {string} - Safe HTTPS URL or fallback
 */
export const getSafeImageUrl = (url, fallback = null) => {
  if (!url) {
    return fallback;
  }
  
  return ensureHttps(url);
};


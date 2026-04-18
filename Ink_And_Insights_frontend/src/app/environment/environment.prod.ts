export const environment = {
  production: import.meta.env.NG_APP_ENV === 'production',
  apiBaseUrl: import.meta.env.NG_APP_API_BASE_URL,
  baseUrlWithoutAPI: import.meta.env.NG_APP_BASE_URL
};
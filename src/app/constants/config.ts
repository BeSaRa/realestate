export const Config = {
  VERSION: 'v1.5.9',
  PRIVATE_VERSION: '',
  BASE_ENVIRONMENT: '',
  ENVIRONMENTS_URLS: {},
  API_VERSION: '',
  EXTERNAL_PROTOCOLS: ['http', 'https'],
  BASE_URL: '',
  TOKEN_HEADER_KEY: 'Authorization',
  TOKEN_STORE_KEY: '$$_T_$$',
  BE: '',
  RECAPTCHA: {
    SITE_KEY: '',
    SECRET_KEY: '',
    RECAPTCHA_TOKEN_VALIDATION_URL: '',
  },
  REFRESH_TOKEN_BEFORE_MS: 120000, // refresh token before 2 minutes from expiration
  LOCAL_STORAGE_KEY: '$$_S__$$',
  MAIN_AUTHORITY_WEBSITE_URL: '',
  MAIN_AUTHORITY_NEWS: '',
  MAIN_AUTHORITY_LAWS: '',
  MAX_FILES_SIZE_IN_MB: 50,
  AUTHORITY_AI: {
    BASE_URL: '',
    SPEECH_LANGUAGES: [],
    AZURE_X_FUNCTION_KEY: '',
    PUBLIC_ACCESS_TOKEN: '',
  },
};

export type ConfigType = typeof Config;

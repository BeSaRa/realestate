export const Config = {
  VERSION: '',
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
};

export type ConfigType = typeof Config;

export const EndPoints = {
  BASE_URL: '',
  TRANSLATION: 'http://eblaepm.no-ip.org:8055/translations',
  BE: 'http://eblaepm.no-ip.org:7800/mme-services/',
  LOOKUPS: 'BE|kpi/rent/lookup',
};

export type EndpointsType = typeof EndPoints;

export const EndPoints = {
  BASE_URL: '',
  TRANSLATION: 'http://eblaepm.no-ip.org:8055/translations',
  BE: 'http://eblaepm.no-ip.org:7800/mme-services/',
  LOOKUPS: 'BE|kpi/rent/lookup',
  RENT: 'BE|kpi/rent',
  DEFAULT_RENT: 'RENT|default',
  RENT_KPI1: 'RENT|total-contracts', // root
  RENT_KPI2: 'RENT|total-contracts/purpose',
  RENT_KPI3: 'RENT|total-contracts/property',
  RENT_KPI4: 'RENT|total-units', // root
  RENT_KPI5: 'RENT|total-units/purpose',
  RENT_KPI6: 'RENT|total-units/property',
  RENT_KPI7: 'RENT|contract-value', // root
  RENT_KPI8: 'RENT|contract-value/purpose',
  RENT_KPI9: 'RENT|contract-value/property',
  RENT_KPI10: 'RENT|total-area', // root
  RENT_KPI11: 'RENT|total-area/purpose',
  RENT_KPI12: 'RENT|total-area/property',
  RENT_KPI13: 'RENT|mean-value', // root
  RENT_KPI14: 'RENT|mean-value/purpose',
  RENT_KPI15: 'RENT|mean-value/property',
  RENT_KPI16: 'RENT|mean-area', // root
  RENT_KPI17: 'RENT|mean-area/purpose',
  RENT_KPI18: 'RENT|mean-area/property',
  RENT_KPI19: 'RENT|chart/contract-number',
  RENT_KPI20: 'RENT|chart/units',
  RENT_KPI21: 'RENT|chart/contract-value',
  RENT_KPI22: 'RENT|chart/area',
  RENT_KPI23: 'RENT|chart/rent-mean-value',
  RENT_KPI24: 'RENT|chart/rent-sqt-meter',
};

export type EndpointsType = typeof EndPoints;

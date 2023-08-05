export const EndPoints = {
  BASE_URL: '',
  TRANSLATION: 'http://eblaepm.no-ip.org:8055/translations',
  BE: 'http://eblaepm.no-ip.org:7800/mme-services/',
  LOOKUPS: 'BE|kpi/rent/lookup',
  RENT: 'BE|kpi/rent',
  DEFAULT_RENT: 'RENT|default',
  RENT_KPI1: 'RENT|kpi1/total-contracts', // root
  RENT_KPI2: 'RENT|kpi2/total-contracts/purpose',
  RENT_KPI3: 'RENT|kpi3/total-contracts/property',
  RENT_KPI4: 'RENT|kpi4/total-units', // root
  RENT_KPI5: 'RENT|kpi5/total-units/purpose',
  RENT_KPI6: 'RENT|kpi6/total-units/property',
  RENT_KPI7: 'RENT|kpi7/contract-value', // root
  RENT_KPI8: 'RENT|kpi8/contract-value/purpose',
  RENT_KPI9: 'RENT|kpi9/contract-value/property',
  RENT_KPI10: 'RENT|kpi10/total-area', // root
  RENT_KPI11: 'RENT|kpi11/total-area/purpose',
  RENT_KPI12: 'RENT|kpi12/total-area/property',
  RENT_KPI13: 'RENT|kpi13/mean-value', // root
  RENT_KPI14: 'RENT|kpi14/mean-value/purpose',
  RENT_KPI15: 'RENT|kpi15/mean-value/property',
  RENT_KPI16: 'RENT|kpi16/mean-area', // root
  RENT_KPI17: 'RENT|kpi17/mean-area/purpose',
  RENT_KPI18: 'RENT|kpi18/mean-area/property',
  RENT_KPI19: 'RENT|kpi19/chart/contract-number',
  RENT_KPI20: 'RENT|kpi20/chart/units',
  RENT_KPI21: 'RENT|kpi21/chart/contract-value',
  RENT_KPI22: 'RENT|kpi22/chart/area',
  RENT_KPI23: 'RENT|kpi23/chart/rent-mean-value',
  RENT_KPI24: 'RENT|kpi24/chart/rent-sqt-meter',
  RENT_KPI29: 'RENT|kpi29/summary',
  // top 10
  RENT_KPI30: 'RENT|kpi30/stats/certificate-count',
  RENT_KPI31: 'RENT|kpi31/stats/mean-rent-amount',
  RENT_KPI32: 'RENT|kpi32/stats/rent-amount',
  RENT_KPI33: 'RENT|kpi33/stats/area',
  RENT_KPI30_1: 'RENT|kpi30_1/stats/contract-count',
  RENT_KPI31_1: 'RENT|kpi31_1/stats/mean-rent-meter',
};

export type EndpointsType = typeof EndPoints;

export const PagesSections = {
  SELL_PAGE: {
    ROOT_KPIS: 'root-kpis',
    PURPOSE_KPIS: 'purpose-kpis',
    PROPERTY_TYPE_KPIS: 'property-type-kpis',
    DURATION_CHART: 'duration-chart',
    TRANSACTIONS_TABLE: 'transationcs-table',

    TOP_10_CHART: 'top-10-chart',
    PURPOSE_AND_TYPE_TABLE: 'purpose-ant-type-table',
    FORECASTING_CHART: 'forecasting-chart',
    COMPOSITE_TABLE: 'componsite-table',
  },

  RENT_PAGE: {
    ROOT_KPIS: 'root-kpis',
    PURPOSE_KPIS: 'purpose-kpis',
    PROPERTY_TYPE_KPIS: 'property-type-kpis',
    DURATION_CHART: 'duration-chart',
    TRANSACTIONS_TABLE: 'transationcs-table',

    TOP_10_CHART: 'top-10-chart',
    PURPOSE_AND_TYPE_TABLE: 'purpose-ant-type-table',
    FORECASTING_CHART: 'forecasting-chart',
    COMPOSITE_TABLE: 'componsite-table',
    RENT_PER_BEDROOMS: 'rent-per-bedrooms',
    RENT_PER_FURNITURE: 'rent-per-furniture',
  },

  MORT_PAGE: {
    ROOT_KPIS: 'root-kpis',
    COUNT_CHART: 'count-chart',
    UNITS_CHART: 'units-chart',
    VALUE_CHART: 'value-chart',
  },

  OWNER_PAGE: {
    OWNER_ROOT_KPIS: 'owner-root-kpis',
    OWNER_PURPOSE_KPIS: 'owner-purpose-kpis',
    OWNER_PROPERTY_TYPE_KPIS: 'owner-property-type-kpis',
    OWNER_MUNICIPALITY_CHART: 'owner-municipality-chart',
    OWNER_AREA_CHART: 'owner-area-chart',

    OWNERSHIP_ROOT_KPIS: 'ownership-root-kpis',
    OWNERSHIP_NATIONALITY_CHART: 'ownership-nationality-chart',
    OWNERSHIP_MUNICIPALITY_CHART: 'ownership-municipality-chart',
    OWNERSHIP_AREA_CHART: 'ownership-area-chart',
    OWNERSHIP_DURATION_CHART: 'ownership-duration-chart',
    OWNERSHIP_TRANSACTIONS_TABLE: 'ownership-transations-table',
    OWNERSHIP_PER_AGE: 'ownership-per-age',
    OWNERSHIP_PER_GENDER: 'ownership-per-gender',
    OWNERSHIP_PER_OWNER_CATEGORY: 'ownership-per-owner-category',
  },

  OCCUPATION_PAGE: {
    ROOT_KPIS: 'root-kpis',
    PREMISE_CATEGORY_KPIS: 'premise-category-kpis',
    PREMISE_TYPE_KPIS: 'premise-type-kpis',
    DURATION_CHART: 'duration-chart',
    MUNICIPALITY_CHART: 'municipality-chart',
    AREA_CHART: 'area-chart',
    TRANSACTIONS_TABLE: 'transactions-table',
  },
};

export type PagesSectionsType = typeof PagesSections;

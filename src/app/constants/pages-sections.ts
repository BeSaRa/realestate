export const PagesSections = {
  SELL_PAGE: {
    SELL_ROOT_KPIS: 'sell-root-kpis',
    SELL_PURPOSE_KPIS: 'sell-purpose-kpis',
    SELL_PROPERTY_TYPE_KPIS: 'sell-property-type-kpis',
    SELL_DURATION_CHART: 'sell-duration-chart',
    SELL_TRANSACTIONS_TABLE: {
      name: 'sell-transactions-table',
      columns: {
        LOCATION: 'location',
        SOLD_FOR: 'sold-for',
        AREA: 'area',
        SQUARE_PRICE: 'square-price',
        ISSUE_DATE: 'issue-date',
        ROI: 'roi',
      },
    },

    SELL_TOP_10_CHART: 'sell-top-10-chart',
    SELL_PURPOSE_AND_TYPE_TABLE: 'sell-purpose-ant-type-table',
    SELL_FORECASTING_CHART: 'sell-forecasting-chart',
    SELL_COMPOSITE_TABLE: 'sell-componsite-table',
  },

  RENT_PAGE: {
    RENT_ROOT_KPIS: 'rent-root-kpis',
    RENT_PURPOSE_KPIS: 'rent-purpose-kpis',
    RENT_PROPERTY_TYPE_KPIS: 'rent-property-type-kpis',
    RENT_DURATION_CHART: 'rent-duration-chart',
    RENT_TRANSACTIONS_TABLE: {
      name: 'rent-transactions-table',
      columns: {
        MUNICIPALITY: 'municipality',
        UNIT_DETAILS: 'unit-details',
        RENTAL_VALUE: 'rental-value',
        CONTRACT_START_DATE: 'contract-start-date',
        CONTRACT_END_DATE: 'contract-end-date',
      },
    },

    RENT_TOP_10_CHART: 'rent-top-10-chart',
    RENT_PURPOSE_AND_TYPE_TABLE: 'rent-purpose-ant-type-table',
    RENT_FORECASTING_CHART: 'rent-forecasting-chart',
    RENT_COMPOSITE_TABLE: 'rent-componsite-table',
    RENT_PER_BEDROOMS: 'rent-per-bedrooms',
    RENT_PER_FURNITURE: 'rent-per-furniture',
  },

  MORT_PAGE: {
    MORT_ROOT_KPIS: 'mort-root-kpis',
    MORT_COUNT_CHART: 'mort-count-chart',
    MORT_UNITS_CHART: 'mort-units-chart',
    MORT_VALUE_CHART: 'mort-value-chart',
    MORT_TRANSACTIONS_TABLE: {
      name: 'mort-transactions-table',
      columns: {
        LOCATION: 'location',
        MORTGAGED_FOR: 'mortgaged-for',
        AREA: 'area',
        SQUARE_PRICE: 'square-price',
        ISSUE_DATE: 'issue-date',
      },
    },
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
    OWNERSHIP_TRANSACTIONS_TABLE: {
      name: 'ownership-transactions-table',
      columns: {
        UNIT_NUMBER: 'unit-number',
        OWNER_NAME: 'owner-name',
        OWNER_ID: 'owner-id',
        OWNER_SHARES: 'owner-shares',
        DOC_DESCRIPTION: 'doc-description',
        DOC_DATE: 'doc-date',
      },
    },
    OWNERSHIP_PER_AGE: 'ownership-per-age',
    OWNERSHIP_PER_GENDER: 'ownership-per-gender',
    OWNERSHIP_PER_OWNER_CATEGORY: 'ownership-per-owner-category',
  },

  OCCUPATION_PAGE: {
    OCCUPATION_ROOT_KPIS: 'occupation-root-kpis',
    OCCUPATION_PREMISE_CATEGORY_KPIS: 'occupation-premise-category-kpis',
    OCCUPATION_PREMISE_TYPE_KPIS: 'occupation-premise-type-kpis',
    OCCUPATION_DURATION_CHART: 'occupation-duration-chart',
    OCCUPATION_MUNICIPALITY_CHART: 'occupation-municipality-chart',
    OCCUPATION_AREA_CHART: 'occupation-area-chart',
    OCCUPATION_TRANSACTIONS_TABLE: {
      name: 'occupation-transactions-table',
      columns: {
        LOCATION: 'location',
        CATEGORY_AND_TYPE: 'category-and-type',
        OCCUPANCY_STATUS: 'occupancy-status',
        OWNER_ID: 'owner-id',
        TENANT_ID: 'tenant-id',
        RECORD_DATE: 'record-date',
        ELECTRICITY_NUMBER: 'electricity-number',
        WATER_NUMBER: 'water-number',
      },
    },
  },
};

export type PagesSectionsType = typeof PagesSections;

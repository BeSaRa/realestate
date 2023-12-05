export const PagesSections = {
  SELL_PAGE: {
    ROOT_KPIS: 'root-kpis',
    PURPOSE_KPIS: 'purpose-kpis',
    PROPERTY_TYPE_KPIS: 'property-type-kpis',
    DURATION_CHART: 'duration-chart',
    TRANSACTIONS_TABLE: {
      name: 'transactions-table',
      columns: {
        LOCATION: 'location',
        SOLD_FOR: 'sold-for',
        AREA: 'area',
        SQUARE_PRICE: 'square-price',
        ISSUE_DATE: 'issue-date',
        ROI: 'roi',
      },
    },

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
    TRANSACTIONS_TABLE: {
      name: 'transactions-table',
      columns: {
        MUNICIPALITY: 'municipality',
        UNIT_DETAILS: 'unit-details',
        RENTAL_VALUE: 'rental-value',
        CONTRACT_START_DATE: 'contract-start-date',
        CONTRACT_END_DATE: 'contract-end-date',
      },
    },

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
    TRANSACTIONS_TABLE: {
      name: 'transactions-table',
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
    ROOT_KPIS: 'root-kpis',
    PREMISE_CATEGORY_KPIS: 'premise-category-kpis',
    PREMISE_TYPE_KPIS: 'premise-type-kpis',
    DURATION_CHART: 'duration-chart',
    MUNICIPALITY_CHART: 'municipality-chart',
    AREA_CHART: 'area-chart',
    TRANSACTIONS_TABLE: {
      name: 'transactions-table',
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

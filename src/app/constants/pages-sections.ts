export const PagesSections = {
  SELL_PAGE: {
    SELL_ROOT_KPIS: 'sell-root-kpis',
    SELL_PURPOSE_KPIS: 'sell-purpose-kpis',
    SELL_PROPERTY_TYPE_KPIS: 'sell-property-type-kpis',
    SELL_DURATION_CHART: 'sell-duration-chart',
    SELL_TRANSACTIONS_TABLE: {
      name: 'sell-transactions-table',
      columns: {
        LOCATION: 'sell-location',
        SOLD_FOR: 'sell-sold-for',
        AREA: 'sell-area',
        SQUARE_PRICE: 'sell-square-price',
        ISSUE_DATE: 'sell-issue-date',
        ROI: 'sell-roi',
      },
    },

    SELL_TOP_10_CHART: 'sell-top-10-chart',
    SELL_PURPOSE_AND_TYPE_TABLE: 'sell-purpose-ant-type-table',
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
        MUNICIPALITY: 'rent-municipality',
        UNIT_DETAILS: 'rent-unit-details',
        RENTAL_VALUE: 'rent-rental-value',
        ISSUE_DATE: 'rent-issue-date',
        CONTRACT_START_DATE: 'rent-contract-start-date',
        CONTRACT_END_DATE: 'rent-contract-end-date',
      },
    },

    RENT_TOP_10_CHART: 'rent-top-10-chart',
    RENT_PURPOSE_AND_TYPE_TABLE: 'rent-purpose-ant-type-table',
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
        LOCATION: 'mort-location',
        MORTGAGED_FOR: 'mort-mortgaged-for',
        AREA: 'mort-area',
        SQUARE_PRICE: 'mort-square-price',
        ISSUE_DATE: 'mort-issue-date',
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
        UNIT_NUMBER: 'ownership-unit-number',
        OWNER_NAME: 'ownership-owner-name',
        OWNER_ID: 'ownership-owner-id',
        OWNER_SHARES: 'ownership-owner-shares',
        DOC_DESCRIPTION: 'ownership-doc-description',
        DOC_DATE: 'ownership-doc-date',
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
        LOCATION: 'occupation-location',
        CATEGORY_AND_TYPE: 'occupation-category-and-type',
        OCCUPANCY_STATUS: 'occupation-occupancy-status',
        OWNER_ID: 'occupation-owner-id',
        TENANT_ID: 'occupation-tenant-id',
        RECORD_DATE: 'occupation-record-date',
        ELECTRICITY_NUMBER: 'occupation-electricity-number',
        WATER_NUMBER: 'occupation-water-number',
      },
    },
  },
};

export type PagesSectionsType = typeof PagesSections;

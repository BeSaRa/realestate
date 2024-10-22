import { LangKeysContract } from '@contracts/lang-keys-contract';

export enum IndicatorsRoutes {
  RENTAL = '/rental-indicators',
  SELL = '/sell-indicators',
  MORTGAGE = '/mortgage-indicators',
  OWNERSHIP = '/ownership-indicators',
  OCCUPIED_AND_VACANT = '/occupied-and-vacant-indicators',
  FORECASTING = '/forecasting-indicators',
  // BROKERS = '/broker-indicators',
  GENERAL_SECRETARIAT = '/general-secretariat',
}

export const IndicatorsRoutesToLangKey: Record<IndicatorsRoutes, keyof LangKeysContract> = {
  [IndicatorsRoutes.RENTAL]: 'rental_indicator',
  [IndicatorsRoutes.SELL]: 'sell_indicator',
  [IndicatorsRoutes.MORTGAGE]: 'mortgage_indicator',
  [IndicatorsRoutes.OWNERSHIP]: 'ownership_indicator',
  [IndicatorsRoutes.OCCUPIED_AND_VACANT]: 'occupied_and_vacant_indicator',
  [IndicatorsRoutes.FORECASTING]: 'forecasting_indicator',
  // [IndicatorsRoutes.BROKERS]: 'brokers',
  [IndicatorsRoutes.GENERAL_SECRETARIAT]: 'general_secretariat_report',
};

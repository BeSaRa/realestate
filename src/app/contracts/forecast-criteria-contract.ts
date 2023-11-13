import { CriteriaContract } from './criteria-contract';
import { LangKeysContract } from './lang-keys-contract';

export interface ForecastCriteriaContract {
  municipalityId: number;
  areaCode: number;
  propertyTypeId: number;
  purposeId: number;
  zoneId: number;
  streetNo: number;
  bedRoomsCount: number;
}

export interface ForecastCriteriaItemContract {
  key: keyof CriteriaContract;
  forecastKey: keyof ForecastCriteriaContract;
  langKey: keyof LangKeysContract;
  isArray: boolean;
}

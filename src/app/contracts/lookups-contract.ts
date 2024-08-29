import { Lookup } from '@models/lookup';
import { ParamRange } from '@models/param-range';

export interface LookupsContract {
  propertyTypeList: Lookup[];
  rentPurposeList: Lookup[];
  zoneList: Lookup[];
  municipalityList: Lookup[];
  rooms: Lookup[];
  furnitureStatusList: Lookup[];
  durations: Lookup[];
  durationsWithDuration: Lookup[];
  halfYearDurations: Lookup[];
  quarterYearDurations: Lookup[];
  spaces: Lookup[];
  unitStatus: Lookup[];
  districtList: Lookup[];
  nationalityList: Lookup[];
  ownerCategoryList: Lookup[];
  ageCategoryList: Lookup[];
  genderList: Lookup[];
  occupancyStatusList: Lookup[];
  premiseCategoryList: Lookup[];
  premiseTypeList: Lookup[];
  brokerCategoryList: Lookup[];
  brokerTypeList: Lookup[];
  serviceTypeList: Lookup[];
  maxParams: ParamRange[];
}

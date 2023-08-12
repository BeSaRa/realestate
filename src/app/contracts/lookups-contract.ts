import { Lookup } from '@models/lookup';

export interface LookupsContract {
  propertyTypeList: Lookup[];
  rentPurposeList: Lookup[];
  zoneList: Lookup[];
  municipalityList: Lookup[];
  rooms: Lookup[];
  durations: Lookup[];
  halfYearDurations: Lookup[];
  quarterYearDurations: Lookup[];
  spaces: Lookup[];
  unitStatus: Lookup[];
}

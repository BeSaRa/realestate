import { Lookup } from '@models/lookup';

export interface LookupsContract {
  propertyTypeList: Lookup[];
  rentPurposeList: Lookup[];
  zoneList: Lookup[];
  municipalityList: Lookup[];
  rooms: Lookup[];
  durations: Lookup[];
}

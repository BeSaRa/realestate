import { LookupsContract } from '@contracts/lookups-contract';
import { Lookup } from './lookup';

export class LookupsMap implements LookupsContract {
  propertyTypeList!: Lookup[];
  rentPurposeList!: Lookup[];
  zoneList!: Lookup[];
  municipalityList!: Lookup[];
}

import { LookupsContract } from '@contracts/lookups-contract';
import { Lookup } from './lookup';
import { Durations } from '@enums/durations';

export class LookupsMap implements LookupsContract {
  propertyTypeList!: Lookup[];
  rentPurposeList!: Lookup[];
  zoneList!: Lookup[];
  municipalityList!: Lookup[];
  rooms = [
    new Lookup().clone<Lookup>({
      arName: 'ستوديو',
      enName: 'Studio',
      lookupKey: 0,
    }),
    new Lookup().clone<Lookup>({
      arName: 'غرفة واحده',
      enName: 'One Room',
      lookupKey: 1,
    }),
    new Lookup().clone<Lookup>({
      arName: 'غرفتين',
      enName: 'Two Rooms',
      lookupKey: 2,
    }),
    new Lookup().clone<Lookup>({
      arName: 'ثلاث غرف',
      enName: 'Three Rooms',
      lookupKey: 3,
    }),
    new Lookup().clone<Lookup>({
      arName: 'أربع  غرف',
      enName: 'Four Rooms',
      lookupKey: 4,
    }),
  ];
  durations = [
    new Lookup().clone<Lookup>({
      arName: 'سنوي',
      enName: 'Yearly',
      lookupKey: Durations.YEARLY,
    }),
    new Lookup().clone<Lookup>({
      arName: 'غرفة واحده',
      enName: 'One Room',
      lookupKey: 1,
    }),
    new Lookup().clone<Lookup>({
      arName: 'غرفتين',
      enName: 'Two Rooms',
      lookupKey: 2,
    }),
    new Lookup().clone<Lookup>({
      arName: 'ثلاث غرف',
      enName: 'Three Rooms',
      lookupKey: 3,
    }),
    new Lookup().clone<Lookup>({
      arName: 'أربع  غرف',
      enName: 'Four Rooms',
      lookupKey: 4,
    }),
  ];
}

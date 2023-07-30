import { LookupsContract } from '@contracts/lookups-contract';
import { Lookup } from './lookup';
import { Durations } from '@enums/durations';
import { HalfYearDurations } from '@enums/half-year-durations';
import { QuarterYearDurations } from '@enums/quarter-year-durations';
import { Spaces } from '@enums/spaces';

export class LookupsMap implements LookupsContract {
  propertyTypeList!: Lookup[];
  rentPurposeList!: Lookup[];
  zoneList!: Lookup[];
  municipalityList!: Lookup[];
  rooms = [
    new Lookup().clone<Lookup>({
      arName: 'ستوديو',
      enName: 'Studio',
      lookupKey: 1,
    }),
    new Lookup().clone<Lookup>({
      arName: 'غرفة واحده',
      enName: 'One Room',
      lookupKey: 2,
    }),
    new Lookup().clone<Lookup>({
      arName: 'غرفتين',
      enName: 'Two Rooms',
      lookupKey: 3,
    }),
    new Lookup().clone<Lookup>({
      arName: 'ثلاث غرف',
      enName: 'Three Rooms',
      lookupKey: 4,
    }),
    new Lookup().clone<Lookup>({
      arName: 'أربع  غرف',
      enName: 'Four Rooms',
      lookupKey: 5,
    }),
  ];

  durations = [
    new Lookup().clone<Lookup>({
      arName: 'سنوي',
      enName: 'Yearly',
      lookupKey: Durations.YEARLY,
    }),
    new Lookup().clone<Lookup>({
      arName: 'نصف سنوى',
      enName: 'Half Yearly',
      lookupKey: Durations.HALF_YEARLY,
    }),
    new Lookup().clone<Lookup>({
      arName: 'ربع سنوي',
      enName: 'Quarter Yearly',
      lookupKey: Durations.QUARTER_YEARLY,
    }),
    new Lookup().clone<Lookup>({
      arName: 'مدة زمنية',
      enName: 'Duration',
      lookupKey: Durations.DURATION,
    }),
  ];

  halfYearDurations = [
    new Lookup().clone<Lookup>({
      arName: 'النصف الاول',
      enName: 'First Half',
      lookupKey: HalfYearDurations.FIRST_HALF,
    }),
    new Lookup().clone<Lookup>({
      arName: 'النصف الاخير',
      enName: 'Last Half',
      lookupKey: HalfYearDurations.LAST_HALF,
    }),
  ];

  quarterYearDurations = [
    new Lookup().clone<Lookup>({
      arName: 'الربع الاول',
      enName: 'First Quarter',
      lookupKey: QuarterYearDurations.FIRST_QUARTER,
    }),
    new Lookup().clone<Lookup>({
      arName: 'الربع الثاني',
      enName: 'Second Quarter',
      lookupKey: QuarterYearDurations.SECOND_QUARTER,
    }),
    new Lookup().clone<Lookup>({
      arName: 'الربع الثالث',
      enName: 'Third Quarter',
      lookupKey: QuarterYearDurations.THIRD_QUARTER,
    }),
    new Lookup().clone<Lookup>({
      arName: 'الربع الاخير',
      enName: 'Last Quarter',
      lookupKey: QuarterYearDurations.LAST_QUARTER,
    }),
  ];

  spaces = [
    new Lookup().clone<Lookup>({
      arName: 'المتر المربع',
      enName: 'Square Meter',
      lookupKey: Spaces.SQUARE_METER,
    }),
    new Lookup().clone<Lookup>({
      arName: 'القدم المربع',
      enName: 'Square Foot',
      lookupKey: Spaces.SQUARE_FOOT,
    }),
  ];
}

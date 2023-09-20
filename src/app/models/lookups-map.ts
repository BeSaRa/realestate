import { LookupsContract } from '@contracts/lookups-contract';
import { Lookup } from './lookup';
import { Durations } from '@enums/durations';
import { HalfYearDurations } from '@enums/half-year-durations';
import { QuarterYearDurations } from '@enums/quarter-year-durations';
import { Spaces } from '@enums/spaces';

export class LookupsMap implements LookupsContract {
  maxParams!: Lookup[];
  districtList!: Lookup[];
  propertyTypeList!: Lookup[];
  rentPurposeList!: Lookup[];
  zoneList!: Lookup[];
  municipalityList!: Lookup[];
  furnitureStatusList!: Lookup[];
  nationalityList!: Lookup[];
  ownerCategoryList!: Lookup[];
  ageCategoryList!: Lookup[];
  genderList!: Lookup[];
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
    new Lookup().clone<Lookup>({
      arName: 'خمس غرف',
      enName: 'five Rooms',
      lookupKey: 5,
    }),
    new Lookup().clone<Lookup>({
      arName: 'ستة غرف',
      enName: 'Six Rooms',
      lookupKey: 6,
    }),
    new Lookup().clone<Lookup>({
      arName: 'سبع غرف',
      enName: 'Seven Rooms',
      lookupKey: 7,
    }),
    new Lookup().clone<Lookup>({
      arName: 'غير محدد',
      enName: 'indefinite',
      lookupKey: undefined,
    }) /*
    new Lookup().clone<Lookup>({
      arName: 'ثماني غرف',
      enName: 'eight Rooms',
      lookupKey: 8,
    }),
    new Lookup().clone<Lookup>({
      arName: 'تسع غرف',
      enName: 'Nine Rooms',
      lookupKey: 9,
    }),
    new Lookup().clone<Lookup>({
      arName: 'عشر غرف',
      enName: 'Ten Rooms',
      lookupKey: 10,
    }),*/,
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
      arName: 'شهري',
      enName: 'Monthly',
      lookupKey: Durations.MONTHLY,
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

  unitStatus = [
    new Lookup().clone<Lookup>({
      arName: 'مباع',
      enName: 'sold',
      lookupKey: 0,
    }),
    new Lookup().clone<Lookup>({
      arName: 'جديد',
      enName: 'new',
      lookupKey: 1,
    }),
  ];
}

import { InterceptModel } from 'cast-response';
import { Lookup } from './lookup';
import { GeneralSecretariatTransactionInterceptor } from '@model-interceptors/general-secretariat-interceptor';

const { receive, send } = new GeneralSecretariatTransactionInterceptor();

@InterceptModel({ receive, send })
export class GeneralSecretariatTransaction {
  readonly occupationMap: Record<number, Lookup> = {
    0: new Lookup().clone<Lookup>({
      arName: '---',
      enName: '---',
    }),
    1: new Lookup().clone<Lookup>({
      arName: 'مشغول',
      enName: 'Occupied',
    }),
    2: new Lookup().clone<Lookup>({
      arName: 'شاغر',
      enName: 'Vacant',
    }),
    3: new Lookup().clone<Lookup>({
      arName: 'ليس في كهرماء',
      enName: 'Not in Kahramaa',
    }),
    4: new Lookup().clone<Lookup>({
      arName: 'لايوجد رقم كهرباء',
      enName: 'No Electricity_NO',
    }),
  };

  area!: number;
  bedRoomsCount!: number;
  buildingNo!: number;
  certificateCode!: string;
  electricityNo!: number;
  endDate!: string;
  furnitureStatusId!: number;
  issueDate!: string;
  municipalityid!: number;
  zoneNo!: number;
  occupancyStatus!: number;
  pinNo!: number; //
  propertyDescription!: string;
  propertyTypeId!: number;
  purposeId!: number;
  rentPaymentAmount!: number;
  rentPaymentFrequency!: number;
  startDate!: string;
  streetNo!: number;
  subUnitCount!: number; //
  waterNo!: number;

  municipalityInfo!: Lookup;
  zoneInfo!: Lookup;
  furnitureInfo!: Lookup;
  purposeInfo!: Lookup;
  propertyTypeInfo!: Lookup;
  occupancyStatusInfo!: Lookup;
}

import { InterceptModel } from 'cast-response';
import { Lookup } from './lookup';
import { GeneralSecretariatTransactionInterceptor } from '@model-interceptors/general-secretariat-interceptor';

const { receive, send } = new GeneralSecretariatTransactionInterceptor();

@InterceptModel({ receive, send })
export class GeneralSecretariatTransaction {
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
  occupancyStatus!: string;
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
}

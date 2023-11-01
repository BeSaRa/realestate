import { OccupancyTransactionInterceptor } from '@model-interceptors/occupancy-transaction-interceptor';
import { Lookup } from './lookup';
import { InterceptModel } from 'cast-response';

const { receive, send } = new OccupancyTransactionInterceptor();

@InterceptModel({ receive, send })
export class OccupancyTransaction {
  municipalityId!: number;
  zoneId!: number;
  occupancyStatus!: number;
  permiseTypeId!: number;
  premiseCategoryId!: number;
  electricityNo!: number;
  ownerId!: string;
  rowDate!: string;
  tenantNumber!: number;
  waterNumber!: number;

  // not related to model
  municipalityInfo!: Lookup;
  zoneInfo!: Lookup;
  occupancyStatusInfo!: Lookup;
  permiseTypeInfo!: Lookup;
  premiseCategoryInfo!: Lookup;
}

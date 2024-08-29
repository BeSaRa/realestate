import { Lookup } from '@models/lookup';
import { InterceptModel } from 'cast-response';
import { RentTransactionInterceptor } from '@model-interceptors/rent-transaction-interceptor';

const { receive, send } = new RentTransactionInterceptor();

@InterceptModel({ receive, send })
export class RentTransaction {
  municipalityid!: number;
  area!: number;
  bedRoomsCount!: number;
  propertyTypeId!: number;
  rentPaymentMonthly!: number;
  issueYear!: number;
  issueDate!: string;
  startDate!: string;
  endDate!: string;
  unitNo!: number;
  unitOwner!: number;
  unitBroker!: number;
  unitTenant!: number;
  serviceTypeId!: number;

  municipalityInfo!: Lookup;
  propertyTypeInfo!: Lookup;
  serviceTypeInfo!: Lookup;
}

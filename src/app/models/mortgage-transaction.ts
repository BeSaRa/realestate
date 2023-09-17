import { InterceptModel } from 'cast-response';
import { Lookup } from './lookup';
import { MortgageTransactionInterceptor } from '@model-interceptors/mortgage-transaction-interceptor';

const { receive, send } = new MortgageTransactionInterceptor();

@InterceptModel({ receive, send })
export class MortgageTransaction {
  areaCode!: number;
  issueDate!: string;
  municipalityId!: number;
  priceMT!: number;
  realEstateValue!: number;
  realEstateArea!: number;
  seller!: string;
  buyer!: string;
  unitNo!: number;
  unitStatus!: number;

  // not related to model
  municipalityInfo!: Lookup;
  areaInfo!: Lookup;
  unitStatusInfo!: Lookup;
}

import { SellTransactionInterceptor } from '@model-interceptors/sell-transaction-interceptor';
import { InterceptModel } from 'cast-response';
import { Lookup } from './lookup';

const { receive, send } = new SellTransactionInterceptor();

@InterceptModel({ receive, send })
export class SellTransaction {
  areaCode!: number;
  issueDate!: string;
  municipalityId!: number;
  priceMT!: number;
  realEstateValue!: number;
  roi!: number;
  soldTo!: string;
  unitNo!: number;
  unitStatus!: number;
  realEstateSQT!: number;
  // not related to model
  municipalityInfo!: Lookup;
  areaInfo!: Lookup;
  unitStatusInfo!: Lookup;
}

import { Lookup } from '@models/lookup';
import { InterceptModel } from 'cast-response';
import { CompositeTransactionInterceptor } from '@model-interceptors/composite-transaction-interceptor';

const { send, receive } = new CompositeTransactionInterceptor();
@InterceptModel({ send, receive })
export class CompositeTransaction {
  issueYear!: number;
  kpi1Val!: number;
  kpi2Val!: number;
  kpi3Val!: number;
  kpi1YoYVal!: number;
  kpi2YoYVal!: number;
  kpi3YoYVal!: number;
  municipalityId!: number;
  municipalityInfo!: Lookup;
}

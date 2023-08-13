import { Lookup } from '@models/lookup';
import { InterceptModel } from 'cast-response';
import { CompositeTransactionInterceptor } from '@model-interceptors/composite-transaction-interceptor';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';

const lookupService = ServiceRegistry.get<LookupService>('LookupService');
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

const { send, rentReceive, sellReceive } = new CompositeTransactionInterceptor();
@InterceptModel({
  send,
  receive: rentReceive,
})
export class RentCompositeTransaction extends CompositeTransaction {}

@InterceptModel({
  send,
  receive: sellReceive,
})
export class SellCompositeTransaction extends CompositeTransaction {}

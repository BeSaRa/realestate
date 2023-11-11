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
  constructor(
    _issueYear: number,
    _municipalityId: number,
    _municipalityInfo: Lookup,
    _kpi1YoYVal: number,
    _kpi2YoYVal: number,
    _kpi3YoYVal: number,
    _kpi1Val = 0,
    _kpi2Val = 0,
    _kpi3Val = 0
  ) {
    this.issueYear = _issueYear;
    this.kpi1Val = _kpi1Val;
    this.kpi2Val = _kpi2Val;
    this.kpi3Val = _kpi3Val;
    this.kpi1YoYVal = _kpi1YoYVal;
    this.kpi2YoYVal = _kpi2YoYVal;
    this.kpi3YoYVal = _kpi3YoYVal;
    this.municipalityId = _municipalityId;
    this.municipalityInfo = _municipalityInfo;
  }
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

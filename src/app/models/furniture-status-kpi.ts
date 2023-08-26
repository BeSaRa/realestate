import { InterceptModel } from 'cast-response';
import { Lookup } from './lookup';
import { FurnitureStatusKpiInterceptor } from '@model-interceptors/furniture-status-kpi-interceptor';

const { send, receive } = new FurnitureStatusKpiInterceptor();

@InterceptModel({ send, receive })
export class FurnitureStatusKpi {
  furnitureStatus!: number;
  kpiVal!: number;
  // not related to model
  furnitureStatusInfo!: Lookup;
}

import { ModelInterceptorContract } from 'cast-response';
import { KpiModel } from '@models/kpi-model';

export class KpiModelInterceptor implements ModelInterceptorContract<KpiModel> {
  receive(model: KpiModel): KpiModel {
    return model;
  }

  send(model: Partial<KpiModel>): Partial<KpiModel> {
    return model;
  }
}
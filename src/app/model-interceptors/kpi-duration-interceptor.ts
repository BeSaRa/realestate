import { ModelInterceptorContract } from 'cast-response';
import { KpiDurationModel } from '@models/kpi-duration-model';

export class KpiDurationInterceptor implements ModelInterceptorContract<KpiDurationModel> {
  receive(model: KpiDurationModel): KpiDurationModel {
    return model;
  }

  send(model: Partial<KpiDurationModel>): Partial<KpiDurationModel> {
    return model;
  }
}
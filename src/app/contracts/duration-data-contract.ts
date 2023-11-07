import { KpiBaseDurationModel } from '@abstracts/kpi-base-duration-model';
import { Lookup } from '@models/lookup';

export interface DurationDataContract {
  [duration: number]: {
    period: Lookup;
    kpiValues: KpiBaseDurationModel[];
  };
}

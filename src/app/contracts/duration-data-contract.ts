import { KpiDurationModel } from '@models/kpi-duration-model';
import { Lookup } from '@models/lookup';

export interface DurationDataContract {
  [duration: number]: {
    period: Lookup;
    kpiValues: KpiDurationModel[];
  };
}

import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { KpiForSqUnitModel } from './kpi-for-sq-unit-model';
import { KpiModel } from './kpi-model';
import { KpiBaseDurationModel } from '@abstracts/kpi-base-duration-model';
import { KpiDurationModel } from './kpi-duration-model';
import { KpiDurationForSqUnitModel } from './kpi-duration-for-sq-unti-model';

export class KpiBase {
  static kpiFactory(hasSqUnit: boolean): KpiBaseModel {
    return hasSqUnit ? new KpiForSqUnitModel() : new KpiModel();
  }

  static kpiDurationFactory(hasSqUnit: boolean): KpiBaseDurationModel {
    return hasSqUnit ? new KpiDurationForSqUnitModel() : new KpiDurationModel();
  }
}

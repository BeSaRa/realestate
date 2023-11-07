import { KpiBaseDurationModel } from '@abstracts/kpi-base-duration-model';
import { ClonerMixin } from '@mixins/cloner-mixin';

export class KpiDurationModel extends ClonerMixin(KpiBaseDurationModel) {
  kpiP2PDifference = 0;
  kpiP2PYoY = 0;
  kpiPreviousPeriod = 0;
  kpiVal = 0;

  override getKpiVal(): number {
    return this.kpiVal;
  }
  override getKpiPreviousPeriod(): number {
    return this.kpiPreviousPeriod;
  }
  override getKpiP2PDifference(): number {
    return this.kpiP2PDifference;
  }
  override getKpiP2PYoY(): number {
    return this.kpiP2PYoY;
  }
}

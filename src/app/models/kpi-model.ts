import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { ClonerMixin } from '@mixins/cloner-mixin';

export class KpiModel extends ClonerMixin(KpiBaseModel) {
  kpiVal = 0;
  kpiPreviousYear = 0;
  kpiYoYDifference = 0;
  kpiYoYVal = 0;

  override getKpiVal(): number {
    return this.kpiVal;
  }
  override getKpiPreviousYear(): number {
    return this.kpiPreviousYear;
  }
  override getKpiYoYDifference(): number {
    return this.kpiYoYDifference;
  }
  override getKpiYoYVal(): number {
    return this.kpiYoYVal;
  }
}

import { KpiBaseDurationModel } from '@abstracts/kpi-base-duration-model';

export class KpiDurationModel extends KpiBaseDurationModel {
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

  override resetAllValues(): void {
    this.kpiVal = this.kpiPreviousPeriod = this.kpiP2PYoY = this.kpiP2PDifference = 0;
  }
}

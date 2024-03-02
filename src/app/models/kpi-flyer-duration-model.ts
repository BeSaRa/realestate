import { KpiBaseDurationModel } from '@abstracts/kpi-base-duration-model';

export class KpiFlyerDurationModel extends KpiBaseDurationModel {
  kpiCount = 0;
  percentageDiffPeriod = 0;
  percentageDiffPreviousPeriod = 0;
  prevPeriodCount = 0;
  prevYearSamePeriodCount = 0;

  override getKpiVal(): number {
    return this.kpiCount;
  }
  override getKpiPreviousPeriod(): number {
    return this.prevYearSamePeriodCount;
  }
  override getKpiP2PDifference(): number {
    return this.percentageDiffPreviousPeriod;
  }
  override getKpiP2PYoY(): number {
    return this.percentageDiffPeriod;
  }

  override setAllValues(kpiVal: number, p2PYoY: number, previousPeriodKpi: number, p2pDifferenceKpi: number): void {
    this.kpiCount = kpiVal;
    this.prevPeriodCount = previousPeriodKpi;
    this.prevYearSamePeriodCount = p2pDifferenceKpi;
    this.percentageDiffPeriod = p2PYoY;
  }

  override resetAllValues(): void {
    this.kpiCount =
      this.percentageDiffPeriod =
      this.percentageDiffPreviousPeriod =
      this.prevPeriodCount =
      this.prevYearSamePeriodCount =
        0;
  }
}

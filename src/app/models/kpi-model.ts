import { KpiBaseModel } from '@abstracts/kpi-base-model';

export class KpiModel extends KpiBaseModel {
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

  override setAllValues(kpiVal: number, yoy: number, previousYearKpi: number, yoyDifferenceKpi: number): void {
    this.kpiVal = kpiVal;
    this.kpiPreviousYear = previousYearKpi;
    this.kpiYoYDifference = yoyDifferenceKpi;
    this.kpiYoYVal = yoy;
  }

  override resetAllValues(): void {
    this.kpiVal = this.kpiPreviousYear = this.kpiYoYVal = this.kpiYoYDifference = 0;
  }
}

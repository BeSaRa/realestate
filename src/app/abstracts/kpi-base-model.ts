export abstract class KpiBaseModel {
  issueYear!: number;

  abstract getKpiVal(): number;
  abstract getKpiPreviousYear(): number;
  abstract getKpiYoYDifference(): number;
  abstract getKpiYoYVal(): number;
}

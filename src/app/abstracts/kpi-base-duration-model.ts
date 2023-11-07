export abstract class KpiBaseDurationModel {
  issuePeriod!: number;
  issueYear!: number;

  abstract getKpiVal(): number;
  abstract getKpiPreviousPeriod(): number;
  abstract getKpiP2PDifference(): number;
  abstract getKpiP2PYoY(): number;
}

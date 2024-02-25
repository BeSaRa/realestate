import { ClonerMixin } from '@mixins/cloner-mixin';

export abstract class KpiBaseDurationModel extends ClonerMixin(class {}) {
  issuePeriod!: number;
  issueYear!: number;

  abstract getKpiVal(): number;
  abstract getKpiPreviousPeriod(): number;
  abstract getKpiP2PDifference(): number;
  abstract getKpiP2PYoY(): number;

  abstract setAllValues(kpiVal: number, p2PYoY: number, previousPeriodKpi: number, p2pDifferenceKpi: number): void;
  abstract resetAllValues(): void;
}

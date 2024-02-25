import { ClonerMixin } from '@mixins/cloner-mixin';

export abstract class KpiBaseModel extends ClonerMixin(class {}) {
  issueYear!: number;

  abstract getKpiVal(): number;
  abstract getKpiPreviousYear(): number;
  abstract getKpiYoYDifference(): number;
  abstract getKpiYoYVal(): number;

  abstract setAllValues(kpiVal: number, yoy: number, previousYearKpi: number, yoyDifferenceKpi: number): void;
  abstract resetAllValues(): void;
}

import { ClonerMixin } from '@mixins/cloner-mixin';

export abstract class KpiBaseModel extends ClonerMixin(class {}) {
  issueYear!: number;

  abstract getKpiVal(): number;
  abstract getKpiPreviousYear(): number;
  abstract getKpiYoYDifference(): number;
  abstract getKpiYoYVal(): number;

  abstract resetAllValues(): void;
}

import { ClonerMixin } from '@mixins/cloner-mixin';

export class FlyerCompositeTransaction extends ClonerMixin(class {}) {
  issueYear!: number;
  kpi1Val!: number;
  kpi2Val!: number;
  kpi1YoYVal!: number;
  kpi2YoYVal!: number;
  municipalityId!: number;
}

import { ClonerMixin } from '@mixins/cloner-mixin';

export class CompositeTransaction extends ClonerMixin(class {}) {
  issueYear!: number;
  kpi1Val!: number;
  kpi2Val!: number;
  kpi3Val!: number;
  kpi1YoYVal!: number;
  kpi2YoYVal!: number;
  kpi3YoYVal!: number;
  municipalityId!: number;
}

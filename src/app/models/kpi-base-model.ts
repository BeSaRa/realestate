import { ClonerMixin } from "@mixins/cloner-mixin";
import { GetNamesMixin } from "@mixins/get-names-mixin";

export class KpiBaseModel extends ClonerMixin(GetNamesMixin(class {})){
  issueYear!: number;
  kpiVal!: number;
  kpiPreviousYear!: number;
  kpiYoYDifference!: number;
  kpiYoYVal!: number;
  yoy!: number;
}

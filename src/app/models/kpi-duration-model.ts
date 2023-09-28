import { ClonerMixin } from "@mixins/cloner-mixin";
import { GetNamesMixin } from "@mixins/get-names-mixin";
import { KpiDurationInterceptor } from "@model-interceptors/kpi-duration-interceptor";
import { InterceptModel } from "cast-response";
const { send, receive } = new KpiDurationInterceptor();

@InterceptModel({ send, receive })
export class KpiDurationModel extends ClonerMixin(GetNamesMixin(class {})) {
  actionType!: number;
  issuePeriod!: number;
  issueYear!: number;
  kpiP2PDifference!: number;
  kpiP2PYoY!: number;
  kpiPreviousPeriod!: number;
  kpiVal!: number;

  kpi2P2PYoY!: number;
  kpi2PeriodDifference!: number;
  kpi2PreviousPeriod!: number;
  kpi2Val!: number;
  kpiPeriodDifference!: number;
}

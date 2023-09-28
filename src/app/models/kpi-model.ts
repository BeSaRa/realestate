import { TransactionType } from '@enums/transaction-type';
import { KpiBaseModel } from './kpi-base-model';
import { KpiModelInterceptor } from '@model-interceptors/kpi-model-iterceptor';
import { InterceptModel } from 'cast-response';
const { send, receive } = new KpiModelInterceptor();

@InterceptModel({ send, receive })
export class KpiModel extends KpiBaseModel {
  actionType!: TransactionType;

  issueBaseYear!: number;
  kpi2BaseYear!: number;
  kpi2PreviousYear!: number;
  kpi2Val!: number;
  kpi2YoYBaseDifference!: number;
  kpi2YoYBaseVal!: number;
  kpi2YoYDifference!: number;
  kpi2YoYVal!: number;
  kpiBaseYear!: number;
  kpiYoYBaseDifference!: number;
  kpiYoYBaseVal!: number;

  purposeId!: number;
  propertyTypeId!: number;
}

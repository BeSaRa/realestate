import { TransactionType } from '@enums/transaction-type';
import { KpiBaseModel } from './kpi-base-model';

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

import { TransactionType } from '@enums/transaction-type';

export class KpiModel {
  actionType!: TransactionType;
  issueYear!: number;
  kpiPreviousYear!: number;
  kpiVal!: number;
  kpiYoYDifference!: number;
  kpiYoYVal!: number;

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

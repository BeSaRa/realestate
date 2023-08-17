import { TransactionType } from '@enums/transaction-type';

export class KpiModel {
  actionType!: TransactionType;
  issueYear!: number;
  kpiPreviousYear!: number;
  kpiVal!: number;
  kpiYoYDifference!: number;
  kpiYoYVal!: number;
  purposeId!: number;
  propertyTypeId!: number;
}

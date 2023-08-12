import { SellDefaultContract } from '@contracts/sell-default-contract';

export class SellDefaultValues implements SellDefaultContract {
  issueYear!: number;
  kpi10PreviousYear!: number;
  kpi10Val!: number;
  kpi13PreviousYear!: number;
  kpi13Val!: number;
  kpi16PreviousYear!: number;
  kpi16Val!: number;
  kpi16_2PreviousYear!: number;
  kpi16_2Val!: number;
  kpi1PreviousYear!: number;
  kpi1Val!: number;
  kpi4PreviousYear!: number;
  kpi4Val!: number;
  kpi7PreviousYear!: number;
  kpi7Val!: number;
  kpiYoY1!: number;
  kpiYoY10!: number;
  kpiYoY10Difference!: number;
  kpiYoY13!: number;
  kpiYoY13Difference!: number;
  kpiYoY16!: number;
  kpiYoY16Difference!: number;
  kpiYoY16_2!: number;
  kpiYoY16_2Difference!: number;
  kpiYoY1Difference!: number;
  kpiYoY4!: number;
  kpiYoY4Difference!: number;
  kpiYoY7!: number;
  kpiYoY7Difference!: 0;
}
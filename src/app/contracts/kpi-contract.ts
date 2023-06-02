export interface KpiContract {
  year: number;
  municipality: string;
  avg_value_mt: number;
  avg_value_sqrf: number;
  code: number;
  previosyear: number;
  Yoy_diff: number;
  yoy: number;
  categoryName: string;
  categoryCode: number;
  TType: 'Sell' | 'Mort';
}

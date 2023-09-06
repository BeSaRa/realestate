export interface DialogChartDataContract<T extends { issueYear: number; issueMonth: number }> {
  title: string;
  list: T[];
  mainChart: {
    title: string;
    bindValue: 'string' | ((dataItem: T) => number);
  };
  oppositeChart: {
    title: string;
    bindValue: 'string' | ((dataItem: T) => number);
  };
}

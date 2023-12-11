export interface DurationSeriesDataContract {
  name?: string;
  group?: string;
  data: {
    y: number;
    x: number | string;
    baseYear?: number;
    yoyBase?: number;
    yoy?: number;
    P2Pyoy?: number;
    PreviousPeriodRate?: number;
  }[];
}

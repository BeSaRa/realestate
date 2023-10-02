export interface DurationSeriesDataContract {
  name?: string;
  data: { y: number; x: number | string; yoy?: number; baseYear?: number; yoyBase?: number }[];
}

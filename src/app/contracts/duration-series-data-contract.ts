export interface DurationSeriesDataContract {
  name?: string;
  group?: string;
  data: { y: number; x: number | string; yoy?: number; baseYear?: number; yoyBase?: number }[];
}

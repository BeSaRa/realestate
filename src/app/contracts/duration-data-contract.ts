import { Lookup } from '@models/lookup';

export interface DurationDataContract {
  [duration: number]: {
    period: Lookup;
    kpiValues: { year: number; value: number }[];
  };
}

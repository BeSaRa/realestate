import { StreamDataContract } from './stream-data-contract';

export interface StreamResultContract {
  data: StreamDataContract;
  message: string;
  status: string;
  status_code: number;
}

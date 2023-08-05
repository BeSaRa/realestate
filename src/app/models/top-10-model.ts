import { Lookup } from '@models/lookup';
import { InterceptModel } from 'cast-response';
import { Top10ModelInterceptor } from '@model-interceptors/top-10-model-interceptor';

const { send, receive } = new Top10ModelInterceptor();

@InterceptModel({ send, receive })
export class Top10Model {
  zoneId!: number;
  kpiVal!: number;
  issueYear!: number;
  zoneInfo!: Lookup;
}

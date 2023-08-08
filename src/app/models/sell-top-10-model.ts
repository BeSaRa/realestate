import { SellTop10ModelInterceptor } from '@model-interceptors/sell-top-10-model-interceptor';
import { Lookup } from '@models/lookup';
import { InterceptModel } from 'cast-response';

const { send, receive } = new SellTop10ModelInterceptor();

@InterceptModel({ send, receive })
export class SellTop10Model {
  zoneId!: number;
  kpiVal!: number;
  issueYear!: number;
  zoneInfo!: Lookup;
}

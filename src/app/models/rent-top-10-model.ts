import { Lookup } from '@models/lookup';
import { InterceptModel } from 'cast-response';
import { RentTop10ModelInterceptor } from '@model-interceptors/rent-top-10-model-interceptor';

const { send, receive } = new RentTop10ModelInterceptor();

@InterceptModel({ send, receive })
export class RentTop10Model {
  zoneId!: number;
  kpiVal!: number;
  issueYear!: number;
  zoneInfo!: Lookup;
}

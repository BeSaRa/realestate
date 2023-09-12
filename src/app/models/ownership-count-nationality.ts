import { OwnershipCountNationalityInterceptor } from '@model-interceptors/ownership-count-nationality-interceptor';
import { Lookup } from './lookup';
import { InterceptModel } from 'cast-response';

const { send, receive } = new OwnershipCountNationalityInterceptor();

@InterceptModel({ send, receive })
export class OwnershipCountNationality {
  kpiVal!: number;
  nationalityId!: number;

  // not related to model
  nationalityInfo!: Lookup;
}

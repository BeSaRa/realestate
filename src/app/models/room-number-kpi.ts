import { Lookup } from '@models/lookup';
import { InterceptModel } from 'cast-response';
import { RoomNumberKpiInterceptor } from '@model-interceptors/room-number-kpi-interceptor';

const { send, receive } = new RoomNumberKpiInterceptor();

@InterceptModel({ send, receive })
export class RoomNumberKpi {
  bedRoomsCount!: number;
  kpiVal!: number;
  // not related to model
  roomInfo!: Lookup;
}

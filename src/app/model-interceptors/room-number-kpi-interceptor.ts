import { ModelInterceptorContract } from 'cast-response';
import { RoomNumberKpi } from '@models/room-number-kpi';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { Lookup } from '@models/lookup';

export class RoomNumberKpiInterceptor implements ModelInterceptorContract<RoomNumberKpi> {
  send(model: Partial<RoomNumberKpi>): Partial<RoomNumberKpi> {
    return model;
  }

  receive(model: RoomNumberKpi): RoomNumberKpi {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');
    model.roomInfo =
      lookupService.rentRoomsMap[model.bedRoomsCount || 0] ||
      new Lookup().clone<Lookup>({
        arName: ` غرف${model.bedRoomsCount}`,
        enName: `${model.bedRoomsCount} Rooms`,
      });
    return model;
  }
}

import { ModelInterceptorContract } from 'cast-response';
import { RentTop10Model } from '@models/rent-top-10-model';
import { ServiceRegistry } from '@services/service-registry';
import { LookupService } from '@services/lookup.service';

export class RentTop10ModelInterceptor implements ModelInterceptorContract<RentTop10Model> {
  send(model: Partial<RentTop10Model>): Partial<RentTop10Model> {
    return model;
  }

  receive(model: RentTop10Model): RentTop10Model {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');
    model.zoneInfo = lookupService.rentZonesMap[model.zoneId];
    return model;
  }
}

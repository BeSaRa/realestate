import { ModelInterceptorContract } from 'cast-response';
import { Top10Model } from '@models/top-10-model';
import { ServiceRegistry } from '@services/service-registry';
import { LookupService } from '@services/lookup.service';

export class Top10ModelInterceptor implements ModelInterceptorContract<Top10Model> {
  send(model: Partial<Top10Model>): Partial<Top10Model> {
    return model;
  }

  receive(model: Top10Model): Top10Model {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');
    model.zoneInfo = lookupService.zonesMap[model.zoneId];
    return model;
  }
}

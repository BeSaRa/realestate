import { SellTop10Model } from '@models/sell-top-10-model';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { ModelInterceptorContract } from 'cast-response';
import { Lookup } from '@models/lookup';

export class SellTop10ModelInterceptor implements ModelInterceptorContract<SellTop10Model> {
  send(model: Partial<SellTop10Model>): Partial<SellTop10Model> {
    return model;
  }

  receive(model: SellTop10Model): SellTop10Model {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');
    model.zoneInfo =
      lookupService.sellZonesMap[model.zoneId] ||
      new Lookup().clone<Lookup>({
        arName: `غير معروف ${model.zoneId} `,
        enName: `Unknown ${model.zoneId}`,
        lookupKey: model.zoneId,
      });
    return model;
  }
}

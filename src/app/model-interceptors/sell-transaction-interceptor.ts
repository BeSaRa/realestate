import { SellTransaction } from '@models/sell-transaction';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { ModelInterceptorContract } from 'cast-response';

export class SellTransactionInterceptor implements ModelInterceptorContract<SellTransaction> {
  receive(model: SellTransaction): SellTransaction {
    const lookupService = ServiceRegistry.get('LookupService') as LookupService;
    model.municipalityInfo = lookupService.sellMunicipalitiesMap[model.municipalityId];
    // model.areaInfo = lookupService.sellZonesMap[model.areaCode];
    model.unitStatusInfo = lookupService.sellLookups.unitStatus[model.unitStatus ?? 0];
    return model;
  }

  send(model: Partial<SellTransaction>): Partial<SellTransaction> {
    return model;
  }
}

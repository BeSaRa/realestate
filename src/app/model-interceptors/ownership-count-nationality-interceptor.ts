import { OwnershipCountNationality } from '@models/ownership-count-nationality';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { ModelInterceptorContract } from 'cast-response';

export class OwnershipCountNationalityInterceptor implements ModelInterceptorContract<OwnershipCountNationality> {
  receive(model: OwnershipCountNationality): OwnershipCountNationality {
    const lookupService = ServiceRegistry.get('LookupService') as LookupService;
    model.nationalityInfo = lookupService.ownerNationalityMap[model.nationalityId];
    return model;
  }

  send(model: Partial<OwnershipCountNationality>): Partial<OwnershipCountNationality> {
    return model;
  }
}

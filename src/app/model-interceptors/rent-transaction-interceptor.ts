import { ModelInterceptorContract } from 'cast-response';
import { RentTransaction } from '@models/rent-transaction';
import { ServiceRegistry } from '@services/service-registry';
import { LookupService } from '@services/lookup.service';

export class RentTransactionInterceptor implements ModelInterceptorContract<RentTransaction> {
  receive(model: RentTransaction): RentTransaction {
    const lookupService = ServiceRegistry.get('LookupService') as LookupService;
    model.municipalityInfo = lookupService.rentMunicipalitiesMap[model.municipalityid];
    return model;
  }

  send(model: Partial<RentTransaction>): Partial<RentTransaction> {
    return model;
  }
}

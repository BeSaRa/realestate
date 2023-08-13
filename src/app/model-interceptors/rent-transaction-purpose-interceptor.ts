import { ModelInterceptorContract } from 'cast-response';
import { RentTransactionPurpose } from '@models/rent-transaction-purpose';
import { ServiceRegistry } from '@services/service-registry';
import { LookupService } from '@services/lookup.service';

export class RentTransactionPurposeInterceptor implements ModelInterceptorContract<RentTransactionPurpose> {
  send(model: Partial<RentTransactionPurpose>): Partial<RentTransactionPurpose> {
    return model;
  }

  receive(model: RentTransactionPurpose): RentTransactionPurpose {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');
    console.log(model.purposeId, lookupService.rentPurposeMap);
    model.purposeInfo = lookupService.rentPurposeMap[model.purposeId];
    return model;
  }
}

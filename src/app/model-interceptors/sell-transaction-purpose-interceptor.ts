import { SellTransactionPurpose } from '@models/sell-transaction-purpose';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { ModelInterceptorContract } from 'cast-response';

export class SellTransactionPurposeInterceptor implements ModelInterceptorContract<SellTransactionPurpose> {
  send(model: Partial<SellTransactionPurpose>): Partial<SellTransactionPurpose> {
    return model;
  }

  receive(model: SellTransactionPurpose): SellTransactionPurpose {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');
    model.purposeInfo = lookupService.sellPurposeMap[model.purposeId];
    return model;
  }
}

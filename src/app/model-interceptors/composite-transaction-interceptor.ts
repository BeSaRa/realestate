import { ModelInterceptorContract } from 'cast-response';
import { CompositeTransaction } from '@models/composite-transaction';
import { ServiceRegistry } from '@services/service-registry';
import { LookupService } from '@services/lookup.service';

export class CompositeTransactionInterceptor implements ModelInterceptorContract<CompositeTransaction> {
  send(model: Partial<CompositeTransaction>): Partial<CompositeTransaction> {
    return model;
  }

  receive(model: CompositeTransaction): CompositeTransaction {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');
    model.municipalityInfo = lookupService.municipalitiesMap[model.municipalityId];
    return model;
  }
}

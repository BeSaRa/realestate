import { MortgageTransaction } from '@models/mortgage-transaction';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { ModelInterceptorContract } from 'cast-response';

export class MortgageTransactionInterceptor implements ModelInterceptorContract<MortgageTransaction> {
  receive(model: MortgageTransaction): MortgageTransaction {
    const lookupService = ServiceRegistry.get('LookupService') as LookupService;
    model.municipalityInfo = lookupService.mortMunicipalitiesMap[model.municipalityId];
    model.areaInfo = lookupService.mortDistrictMap[model.areaCode];
    model.unitStatusInfo = lookupService.mortLookups.unitStatus[model.unitStatus ?? 0];
    return model;
  }

  send(model: Partial<MortgageTransaction>): Partial<MortgageTransaction> {
    return model;
  }
}

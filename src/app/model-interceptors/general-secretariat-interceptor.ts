import { GeneralSecretariatTransaction } from '@models/general-secretariat-transaction';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { ModelInterceptorContract } from 'cast-response';

export class GeneralSecretariatTransactionInterceptor
  implements ModelInterceptorContract<GeneralSecretariatTransaction>
{
  receive(model: GeneralSecretariatTransaction): GeneralSecretariatTransaction {
    const lookupService = ServiceRegistry.get('LookupService') as LookupService;
    model.municipalityInfo = lookupService.rentMunicipalitiesMap[model.municipalityid ?? 0];
    model.zoneInfo = lookupService.rentZonesMap[model.zoneNo ?? 0];
    model.purposeInfo = lookupService.rentPurposeMap[model.purposeId];
    model.propertyTypeInfo = lookupService.rentPropertyTypeMap[model.propertyTypeId];
    model.furnitureInfo = lookupService.rentFurnitureMap[model.furnitureStatusId];
    return model;
  }

  send(model: Partial<GeneralSecretariatTransaction>): Partial<GeneralSecretariatTransaction> {
    return model;
  }
}

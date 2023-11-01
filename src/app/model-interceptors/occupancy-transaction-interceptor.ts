import { OccupancyTransaction } from '@models/occupancy-transaction';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { ModelInterceptorContract } from 'cast-response';

export class OccupancyTransactionInterceptor implements ModelInterceptorContract<OccupancyTransaction> {
  receive(model: OccupancyTransaction): OccupancyTransaction {
    const lookupService = ServiceRegistry.get('LookupService') as LookupService;
    model.municipalityInfo = lookupService.ovMunicipalitiesMap[model.municipalityId];
    model.zoneInfo = lookupService.ovZonesMap[model.zoneId];
    model.occupancyStatusInfo = lookupService.ovOccupancyStatusMap[model.occupancyStatus];
    model.premiseCategoryInfo = lookupService.ovPremiseCategoryMap[model.premiseCategoryId];
    model.permiseTypeInfo = lookupService.ovPremiseTypeMap[model.permiseTypeId];
    return model;
  }

  send(model: Partial<OccupancyTransaction>): Partial<OccupancyTransaction> {
    return model;
  }
}

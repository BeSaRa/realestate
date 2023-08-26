import { FurnitureStatusKpi } from '@models/furniture-status-kpi';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { ModelInterceptorContract } from 'cast-response';

export class FurnitureStatusKpiInterceptor implements ModelInterceptorContract<FurnitureStatusKpi> {
  send(model: Partial<FurnitureStatusKpi>): Partial<FurnitureStatusKpi> {
    return model;
  }

  receive(model: FurnitureStatusKpi): FurnitureStatusKpi {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');
    model.furnitureStatusInfo = lookupService.rentFurnitureMap[model.furnitureStatus || 0];
    return model;
  }
}

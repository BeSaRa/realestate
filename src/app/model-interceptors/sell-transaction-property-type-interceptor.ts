import { Lookup } from '@models/lookup';
import { SellTransactionPropertyType } from '@models/sell-transaction-property-type';
import { LookupService } from '@services/lookup.service';
import { ServiceRegistry } from '@services/service-registry';
import { ModelInterceptorContract } from 'cast-response';

export class SellTransactionPurposeInterceptor implements ModelInterceptorContract<SellTransactionPropertyType> {
  send(model: Partial<SellTransactionPropertyType>): Partial<SellTransactionPropertyType> {
    return model;
  }

  receive(model: SellTransactionPropertyType): SellTransactionPropertyType {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');
    model.propertyTypeInfo = lookupService.sellPropertyTypeMap[model.propertyTypeId]  ||
    new Lookup().clone<Lookup>({
      arName: `غير معروف ${model.propertyTypeId} `,
      enName: `Unknown ${model.propertyTypeId}`,
      lookupKey: model.propertyTypeId,
    }); // not all lookups provided by be
    return model;
  }
}

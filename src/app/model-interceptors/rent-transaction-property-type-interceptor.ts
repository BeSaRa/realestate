import { ModelInterceptorContract } from 'cast-response';
import { RentTransactionPropertyType } from '@models/rent-transaction-property-type';
import { ServiceRegistry } from '@services/service-registry';
import { LookupService } from '@services/lookup.service';
import { Lookup } from '@models/lookup';

export class RentTransactionPropertyTypeInterceptor implements ModelInterceptorContract<RentTransactionPropertyType> {
  send(model: Partial<RentTransactionPropertyType>): Partial<RentTransactionPropertyType> {
    return model;
  }

  receive(model: RentTransactionPropertyType): RentTransactionPropertyType {
    const lookupService = ServiceRegistry.get<LookupService>('LookupService');

    // we register an issue that these should not be null. This assign will be removed
    // after fixing the issue form be team
    !model.sumArea && (model.sumArea = 0);
    !model.rentPaymentMeter && (model.rentPaymentMeter = 0);
    !model.rentPaymentSqFeet && (model.rentPaymentSqFeet = 0);

    model.propertyTypeInfo =
      lookupService.rentPropertyTypeMap[model.propertyTypeId] ||
      new Lookup().clone<Lookup>({
        arName: `غير معروف ${model.propertyTypeId} `,
        enName: `Unknown ${model.propertyTypeId}`,
        lookupKey: model.propertyTypeId,
      }); // not all lookups provided by be;
    return model;
  }
}

import { Lookup } from '@models/lookup';
import { RentTransactionPropertyTypeInterceptor } from '@model-interceptors/rent-transaction-property-type-interceptor';
import { InterceptModel } from 'cast-response';
import { MatDialogRef } from '@angular/material/dialog';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { Observable } from 'rxjs';
import { RentTransactionStatistics } from './rent-transaction-statistics';

const { send, receive } = new RentTransactionPropertyTypeInterceptor();

@InterceptModel({ send, receive })
export class RentTransactionPropertyType extends RentTransactionStatistics {
  propertyTypeId!: number;
  propertyTypeInfo!: Lookup;
  openChart(criteria: Partial<RentCriteriaContract>): Observable<MatDialogRef<unknown>> {
    return this.dashboardService.openRentChartDialogBasedOnPrpoertyType({
      ...criteria,
      propertyTypeList: [this.propertyTypeId],
    });
  }
}

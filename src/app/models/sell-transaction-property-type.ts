import { MatDialogRef } from '@angular/material/dialog';
import { SellCriteriaContract } from '@contracts/sell-criteria-contract';
import { SellTransactionPurposeInterceptor } from '@model-interceptors/sell-transaction-property-type-interceptor';
import { InterceptModel } from 'cast-response';
import { Observable } from 'rxjs';
import { Lookup } from './lookup';
import { SellTransactionStatistic } from './sell-transaction-statistic';

const { send, receive } = new SellTransactionPurposeInterceptor();

@InterceptModel({ send, receive })
export class SellTransactionPropertyType extends SellTransactionStatistic {
  
  propertyTypeId!: number;
  propertyTypeInfo!: Lookup;

  openChart(criteria: Partial<SellCriteriaContract>): Observable<MatDialogRef<unknown>> {
    return this.dashboardService.openSellChartDialogBasedOnPropertype({ ...criteria, propertyTypeList: [this.propertyTypeId] });
  }
}
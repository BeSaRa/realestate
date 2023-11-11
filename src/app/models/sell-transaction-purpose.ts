import { MatDialogRef } from '@angular/material/dialog';
import { SellCriteriaContract } from '@contracts/sell-criteria-contract';
import { SellTransactionPurposeInterceptor } from '@model-interceptors/sell-transaction-purpose-interceptor';
import { InterceptModel } from 'cast-response';
import { Observable } from 'rxjs';
import { Lookup } from './lookup';
import { SellTransactionStatistic } from './sell-transaction-statistic';

const { send, receive } = new SellTransactionPurposeInterceptor();

@InterceptModel({ send, receive })
export class SellTransactionPurpose extends SellTransactionStatistic {
  purposeId!: number;
  purposeInfo!: Lookup;

  openChart(criteria: Partial<SellCriteriaContract>): Observable<MatDialogRef<unknown>> {
    return this.dashboardService.openSellChartDialogBasedOnPurpose({ ...criteria, purposeList: [this.purposeId] });
  }
}

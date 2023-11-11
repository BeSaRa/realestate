import { Lookup } from '@models/lookup';
import { RentTransactionPurposeInterceptor } from '@model-interceptors/rent-transaction-purpose-interceptor';
import { InterceptModel } from 'cast-response';
import { MatDialogRef } from '@angular/material/dialog';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { Observable } from 'rxjs';
import { RentTransactionStatistics } from './rent-transaction-statistics';

const { send, receive } = new RentTransactionPurposeInterceptor();

@InterceptModel({ send, receive })
export class RentTransactionPurpose extends RentTransactionStatistics {
  purposeId!: number;
  purposeInfo!: Lookup;

  openChart(criteria: Partial<RentCriteriaContract>): Observable<MatDialogRef<unknown>> {
    return this.dashboardService.openRentChartDialogBasedOnPurpose({ ...criteria, purposeList: [this.purposeId] });
  }
}

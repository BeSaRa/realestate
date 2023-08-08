import { Lookup } from '@models/lookup';
import { RentTransactionPurposeInterceptor } from '@model-interceptors/rent-transaction-purpose-interceptor';
import { InterceptModel } from 'cast-response';
import { MatDialogRef } from '@angular/material/dialog';
import { ServiceRegistry } from '@services/service-registry';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { DashboardService } from '@services/dashboard.service';
import { Observable } from 'rxjs';

const { send, receive } = new RentTransactionPurposeInterceptor();

@InterceptModel({ send, receive })
export class RentTransactionPurpose {
  certificateCount!: number;
  purposeId!: number;
  rentPaymentMeter!: number;
  rentPaymentMonthly!: number;
  rentPaymentSqFeet!: number;
  // not related to the model
  purposeInfo!: Lookup;
  issueMonth!: number;
  issueYear!: number;
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = ServiceRegistry.get<DashboardService>('DashboardService');
  }

  openChart(criteria: Partial<RentCriteriaContract>): Observable<MatDialogRef<unknown>> {
    return this.dashboardService.openRentChartDialogBasedOnPurpose({ ...criteria, purposeList: [this.purposeId] });
  }
}

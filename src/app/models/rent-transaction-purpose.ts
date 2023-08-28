import { Lookup } from '@models/lookup';
import { RentTransactionPurposeInterceptor } from '@model-interceptors/rent-transaction-purpose-interceptor';
import { InterceptModel } from 'cast-response';
import { MatDialogRef } from '@angular/material/dialog';
import { ServiceRegistry } from '@services/service-registry';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { DashboardService } from '@services/dashboard.service';
import { Observable } from 'rxjs';
import { UnitsService } from '@services/units.service';
import { computed } from '@angular/core';

const { send, receive } = new RentTransactionPurposeInterceptor();

@InterceptModel({ send, receive })
export class RentTransactionPurpose {
  certificateCount!: number;
  purposeId!: number;
  rentPaymentMeter!: number;
  rentPaymentMonthly!: number;
  rentPaymentSqFeet!: number;
  sumArea!: number;

  // not related to the model
  purposeInfo!: Lookup;
  issueMonth!: number;
  issueYear!: number;
  private dashboardService: DashboardService;
  private unitsService: UnitsService;

  constructor() {
    this.dashboardService = ServiceRegistry.get<DashboardService>('DashboardService');
    this.unitsService = ServiceRegistry.get<UnitsService>('UnitsService');
  }

  get unitSquareRentPayment() {
    return computed(() => (this.unitsService.selectedUnit() === 1 ? this.rentPaymentMeter : this.rentPaymentSqFeet));
  }

  openChart(criteria: Partial<RentCriteriaContract>): Observable<MatDialogRef<unknown>> {
    return this.dashboardService.openRentChartDialogBasedOnPurpose({ ...criteria, purposeList: [this.purposeId] });
  }
}

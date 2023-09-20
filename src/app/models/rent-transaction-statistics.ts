import { ServiceRegistry } from '@services/service-registry';
import { DashboardService } from '@services/dashboard.service';
import { UnitsService } from '@services/units.service';
import { computed } from '@angular/core';


export class RentTransactionStatistics {
  certificateCount!: number;
  rentPaymentMeter!: number;
  rentPaymentMonthly!: number;
  rentPaymentSqFeet!: number;
  sumArea!: number;

 
  issueMonth!: number;
  issueYear!: number;
  dashboardService: DashboardService;
  unitsService: UnitsService;

  constructor() {
    this.dashboardService = ServiceRegistry.get<DashboardService>('DashboardService');
    this.unitsService = ServiceRegistry.get<UnitsService>('UnitsService');
  }

  get unitSquareRentPayment() {
    return computed(() => (this.unitsService.selectedUnit() === 1 ? this.rentPaymentMeter : this.rentPaymentSqFeet));
  }

//   openChart(criteria: Partial<RentCriteriaContract>): Observable<MatDialogRef<unknown>> {
//     return this.dashboardService.openRentChartDialogBasedOnPurpose({ ...criteria, purposeList: [this.purposeId] });
//   }
}

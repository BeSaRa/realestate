import { MatDialogRef } from '@angular/material/dialog';
import { SellCriteriaContract } from '@contracts/sell-criteria-contract';
import { SellTransactionPurposeInterceptor } from '@model-interceptors/sell-transaction-purpose-interceptor';
import { DashboardService } from '@services/dashboard.service';
import { ServiceRegistry } from '@services/service-registry';
import { InterceptModel } from 'cast-response';
import { Observable } from 'rxjs';
import { Lookup } from './lookup';
import { UnitsService } from '@services/units.service';
import { computed } from '@angular/core';

const { send, receive } = new SellTransactionPurposeInterceptor();

@InterceptModel({ send, receive })
export class SellTransactionPurpose {
  countCertificateCode!: number;
  issueMonth!: number;
  issueYear!: number;
  medianPrice!: number;
  medianPriceMt!: number;
  medianPriceSqf!: number;
  purposeId!: number;
  sumArea!: number;

  // not related to model
  // totalArea: number | null = null;
  purposeInfo!: Lookup;
  private dashboardService: DashboardService;
  private unitsService: UnitsService;

  constructor() {
    this.dashboardService = ServiceRegistry.get<DashboardService>('DashboardService');
    this.unitsService = ServiceRegistry.get<UnitsService>('UnitsService');
  }

  get unitSquareMedianPrice() {
    return computed(() => (this.unitsService.selectedUnit() === 1 ? this.medianPriceMt : this.medianPriceSqf));
  }

  openChart(criteria: Partial<SellCriteriaContract>): Observable<MatDialogRef<unknown>> {
    return this.dashboardService.openSellChartDialogBasedOnPurpose({ ...criteria, purposeList: [this.purposeId] });
  }
}

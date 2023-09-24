
import { DashboardService } from '@services/dashboard.service';
import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';
import { computed } from '@angular/core';


export class SellTransactionStatistic {
  countCertificateCode!: number;
  issueMonth!: number;
  issueYear!: number;
  medianPrice!: number;
  medianPriceMt!: number;
  medianPriceSqf!: number;
  
  sumArea!: number;

  // not related to model
  // totalArea: number | null = null;
  
  dashboardService: DashboardService;
  unitsService: UnitsService;

  constructor() {
    this.dashboardService = ServiceRegistry.get<DashboardService>('DashboardService');
    this.unitsService = ServiceRegistry.get<UnitsService>('UnitsService');
  }

  get unitSquareMedianPrice() {
    return computed(() => (this.unitsService.selectedUnit() === 1 ? this.medianPriceMt : this.medianPriceSqf));
  }
}

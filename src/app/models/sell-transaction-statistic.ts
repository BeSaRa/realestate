import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';

export class SellTransactionStatistic {
  countCertificateCode!: number;
  issueMonth!: number;
  issueYear!: number;
  medianPrice!: number;
  medianPriceMt!: number;
  medianPriceSqf!: number;

  sumArea!: number;

  purposeId!: number;
  propertyTypeId!: number;

  unitsService = ServiceRegistry.get<UnitsService>('UnitsService');

  get unitSquareMedianPrice() {
    return this.unitsService.selectedUnit() === 1 ? this.medianPriceMt : this.medianPriceSqf;
  }
}

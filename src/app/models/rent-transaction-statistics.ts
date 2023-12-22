import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';

export class RentTransactionStatistics {
  certificateCount!: number;
  rentPaymentMeter!: number;
  rentPaymentMonthly!: number;
  rentPaymentSqFeet!: number;
  sumArea!: number;

  issueMonth!: number;
  issueYear!: number;

  purposeId!: number;
  propertyTypeId!: number;

  unitsService = ServiceRegistry.get<UnitsService>('UnitsService');

  get unitSquareRentPayment() {
    return this.unitsService.selectedUnit() === 1 ? this.rentPaymentMeter : this.rentPaymentSqFeet;
  }
}

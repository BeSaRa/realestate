import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';

export class RentTransactionStatistics {
  certificateCount!: number;
  certificateCountNew!: number;
  certificateCountRenewal!: number;
  rentPaymentMeter!: number;
  rentPaymentMeterNew!: number;
  rentPaymentMeterRenewal!: number;
  rentPaymentMonthly!: number;
  rentPaymentMonthlyNew!: number;
  rentPaymentMonthlyRenewal!: number;
  rentPaymentSqFeet!: number;
  rentPaymentSqFeetNew!: number;
  rentPaymentSqFeetRenewal!: number;
  sumArea!: number;

  issueMonth!: number;
  issueYear!: number;

  purposeId!: number;
  propertyTypeId!: number;

  unitsService = ServiceRegistry.get<UnitsService>('UnitsService');

  get unitSquareRentPayment() {
    return this.unitsService.selectedUnit() === 1 ? this.rentPaymentMeter : this.rentPaymentSqFeet;
  }

  get unitSquareRentPaymentNew() {
    return this.unitsService.selectedUnit() === 1 ? this.rentPaymentMeterNew : this.rentPaymentSqFeetNew;
  }

  get unitSquareRentPaymentRenewal() {
    return this.unitsService.selectedUnit() === 1 ? this.rentPaymentMeterRenewal : this.rentPaymentSqFeetRenewal;
  }
}

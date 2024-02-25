import { KpiBaseDurationModel } from '@abstracts/kpi-base-duration-model';
import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';

export class KpiDurationForSqUnitModel extends KpiBaseDurationModel {
  kpiSqft = 0;
  kpiSqftPreviousYear = 0;
  kpiSqftYoYDifference = 0;
  kpiSqftYoYVal = 0;
  kpiSqmt = 0;
  kpiSqmtPreviousYear = 0;
  kpiSqmtYoYDifference = 0;
  kpiSqmtYoYVal = 0;

  private _unitsService: UnitsService;

  constructor() {
    super();
    this._unitsService = ServiceRegistry.get<UnitsService>('UnitsService');
  }

  override getKpiVal(): number {
    return this._unitsService.isMeterSelected() ? this.kpiSqmt : this.kpiSqft;
  }
  override getKpiPreviousPeriod(): number {
    return this._unitsService.isMeterSelected() ? this.kpiSqmtPreviousYear : this.kpiSqftPreviousYear;
  }
  override getKpiP2PDifference(): number {
    return this._unitsService.isMeterSelected() ? this.kpiSqmtYoYDifference : this.kpiSqftYoYDifference;
  }
  override getKpiP2PYoY(): number {
    return this._unitsService.isMeterSelected() ? this.kpiSqmtYoYVal : this.kpiSqftYoYVal;
  }

  override setAllValues(kpiVal: number, p2PYoY: number, previousPeriodKpi: number, p2pDifferenceKpi: number): void {
    if (this._unitsService.isMeterSelected()) {
      this.kpiSqmt = kpiVal;
      this.kpiSqft = kpiVal * 10.8;
      this.kpiSqmtPreviousYear = previousPeriodKpi;
      this.kpiSqftPreviousYear = previousPeriodKpi * 10.8;
      this.kpiSqmtYoYDifference = p2pDifferenceKpi;
      this.kpiSqftYoYDifference = p2pDifferenceKpi * 10.8;
    } else {
      this.kpiSqmt = kpiVal / 10.8;
      this.kpiSqft = kpiVal;
      this.kpiSqmtPreviousYear = previousPeriodKpi / 10.8;
      this.kpiSqftPreviousYear = previousPeriodKpi;
      this.kpiSqmtYoYDifference = p2pDifferenceKpi / 10.8;
      this.kpiSqftYoYDifference = p2pDifferenceKpi;
    }

    this.kpiSqmtYoYVal = this.kpiSqftYoYVal = p2PYoY;
  }

  override resetAllValues(): void {
    this.kpiSqft =
      this.kpiSqftPreviousYear =
      this.kpiSqftYoYDifference =
      this.kpiSqftYoYVal =
      this.kpiSqmt =
      this.kpiSqmtPreviousYear =
      this.kpiSqmtYoYDifference =
      this.kpiSqmtYoYVal =
        0;
  }
}

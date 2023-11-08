import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';

export class KpiForSqUnitModel extends KpiBaseModel {
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
  override getKpiPreviousYear(): number {
    return this._unitsService.isMeterSelected() ? this.kpiSqmtPreviousYear : this.kpiSqftPreviousYear;
  }
  override getKpiYoYDifference(): number {
    return this._unitsService.isMeterSelected() ? this.kpiSqmtYoYDifference : this.kpiSqftYoYDifference;
  }
  override getKpiYoYVal(): number {
    return this._unitsService.isMeterSelected() ? this.kpiSqmtYoYVal : this.kpiSqftYoYVal;
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

import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { SqUnit } from '@enums/sq-unit';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';

export class KpiForSqUnitModel extends ClonerMixin(KpiBaseModel) {
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
    return this._unitsService.selectedUnit() === SqUnit.SQUARE_METER ? this.kpiSqmt : this.kpiSqft;
  }
  override getKpiPreviousYear(): number {
    return this._unitsService.selectedUnit() === SqUnit.SQUARE_METER
      ? this.kpiSqmtPreviousYear
      : this.kpiSqftPreviousYear;
  }
  override getKpiYoYDifference(): number {
    return this._unitsService.selectedUnit() === SqUnit.SQUARE_METER
      ? this.kpiSqmtYoYDifference
      : this.kpiSqftYoYDifference;
  }
  override getKpiYoYVal(): number {
    return this._unitsService.selectedUnit() === SqUnit.SQUARE_METER ? this.kpiSqmtYoYVal : this.kpiSqftYoYVal;
  }
}

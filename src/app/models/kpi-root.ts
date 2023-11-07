import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { GetNamesMixin } from '@mixins/get-names-mixin';
import { KpiModel } from './kpi-model';
import { KpiForSqUnitModel } from './kpi-for-sq-unit-model';
import { UnitsService } from '@services/units.service';
import { ServiceRegistry } from '@services/service-registry';

export class KpiRoot extends ClonerMixin(GetNamesMixin(class {})) {
  id!: number;
  url!: string;
  purposeUrl = '';
  propertyTypeUrl = '';
  chartDataUrl = '';
  iconUrl = 'assets/icons/kpi/svg/1.svg';

  hasPrice = false;
  hasSqUnit = false;
  isDataAvailable = true;
  selected = false;

  private _unitsService: UnitsService;

  private _kpiData!: KpiBaseModel;

  set kpiData(value: KpiBaseModel) {
    this._kpiData = value;
  }

  get kpiData() {
    if (!this._kpiData) {
      this._kpiData = this.hasSqUnit ? new KpiForSqUnitModel() : new KpiModel();
    }
    return this._kpiData;
  }

  constructor() {
    super();
    this._unitsService = ServiceRegistry.get<UnitsService>('UnitsService');
  }

  override getNames(): string {
    let _name = super.getNames();
    if (this.hasSqUnit) _name += ' "' + this._unitsService.selectedUnitInfo().getNames() + '"';
    return _name;
  }
}

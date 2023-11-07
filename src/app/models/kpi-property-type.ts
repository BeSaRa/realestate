import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { GetNamesMixin } from '@mixins/get-names-mixin';
import { KpiModel } from './kpi-model';

export class KpiPropertyType extends ClonerMixin(GetNamesMixin(class {})) {
  id!: number;

  selected = false;

  private _kpiData!: KpiBaseModel;

  set kpiData(value: KpiBaseModel) {
    this._kpiData = value;
  }

  get kpiData() {
    if (!this._kpiData) {
      this._kpiData = new KpiModel();
    }
    return this._kpiData;
  }
}

import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';
import { isNullOrUndefined } from 'util';

export class Top10KpiModel {
  zoneId!: number;
  issueYear!: number;

  kpiVal!: number;

  priceMT!: number;
  priceSQ!: number;

  realEstateMT!: number;
  realEstateSQT!: number;

  private _unitsService: UnitsService;

  constructor() {
    this._unitsService = ServiceRegistry.get<UnitsService>('UnitsService');
  }

  getKpiVal() {
    if (this.kpiVal !== undefined) return this.kpiVal;
    if (this.priceMT !== undefined) return this._unitsService.isMeterSelected() ? this.priceMT : this.priceSQ;
    return this._unitsService.isMeterSelected() ? this.realEstateMT : this.realEstateMT;
  }
}

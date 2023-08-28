import { Injectable, computed, signal } from '@angular/core';
import { ServiceContract } from '@contracts/service-contract';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { Lookup } from '@models/lookup';

@Injectable({
  providedIn: 'root',
})
export class UnitsService extends RegisterServiceMixin(class {}) implements ServiceContract {
  serviceName = 'UnitsService';

  readonly units = [
    new Lookup().clone({
      arName: 'متر مربع',
      enName: 'square meter',
      lookupKey: 1,
    }),
    new Lookup().clone({
      arName: 'قدم مربع',
      enName: 'square foot',
      lookupKey: 2,
    }),
  ];

  private _units = this.units.reduce(
    (acc, cur) => ({ ...acc, [cur.lookupKey]: cur as Lookup }),
    {} as Record<number, Lookup>
  );

  private _selectedUnitSignal = signal(this._units[1].lookupKey);

  selectedUnit = computed(() => this._selectedUnitSignal());
  selectedUnitInfo = computed(() => this._units[this._selectedUnitSignal()]);

  setUnit(lookupKey: 1 | 2) {
    this._selectedUnitSignal.set(lookupKey);
  }
}

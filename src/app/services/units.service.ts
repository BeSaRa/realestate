import { Injectable, computed, signal } from '@angular/core';
import { ServiceContract } from '@contracts/service-contract';
import { Unit } from '@enums/unit';
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
      lookupKey: Unit.SQUARE_METER,
    }),
    new Lookup().clone({
      arName: 'قدم مربع',
      enName: 'square foot',
      lookupKey: Unit.SQUARE_FEET,
    }),
  ];

  private _units = this.units.reduce(
    (acc, cur) => ({ ...acc, [cur.lookupKey]: cur as Lookup }),
    {} as Record<Unit, Lookup>
  );

  private _selectedUnitSignal = signal(this._units[Unit.SQUARE_FEET].lookupKey as Unit);

  selectedUnit = computed(() => this._selectedUnitSignal());
  selectedUnitInfo = computed(() => this._units[this._selectedUnitSignal()]);

  setUnit(lookupKey: Unit) {
    this._selectedUnitSignal.set(lookupKey);
  }
}

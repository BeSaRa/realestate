import { Injectable, computed, signal } from '@angular/core';
import { ServiceContract } from '@contracts/service-contract';
import { SqUnit } from '@enums/sq-unit';
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
      lookupKey: SqUnit.SQUARE_METER,
    }),
    new Lookup().clone({
      arName: 'قدم مربع',
      enName: 'square foot',
      lookupKey: SqUnit.SQUARE_FEET,
    }),
  ];

  private _units = this.units.reduce(
    (acc, cur) => ({ ...acc, [cur.lookupKey]: cur as Lookup }),
    {} as Record<SqUnit, Lookup>
  );

  private _selectedUnitSignal = signal(SqUnit.SQUARE_FEET);

  selectedUnit = computed(() => this._selectedUnitSignal());
  selectedUnitInfo = computed(() => this._units[this._selectedUnitSignal()]);

  setUnit(lookupKey: SqUnit) {
    this._selectedUnitSignal.set(lookupKey);
  }
}

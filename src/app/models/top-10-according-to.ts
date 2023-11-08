import { ClonerMixin } from '@mixins/cloner-mixin';
import { GetNamesMixin } from '@mixins/get-names-mixin';
import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';

export class Top10AccordingTo extends ClonerMixin(GetNamesMixin(class {})) {
  id!: number;
  url!: string;

  disabled = false;
  hasPrice = false;
  hasSqUnit = false;

  private _unitsService: UnitsService;

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

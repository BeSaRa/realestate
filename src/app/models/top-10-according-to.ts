import { ClonerMixin } from '@mixins/cloner-mixin';
import { GetNamesMixin } from '@mixins/get-names-mixin';
import { ServiceRegistry } from '@services/service-registry';
import { UnitsService } from '@services/units.service';
import { CriteriaSpecificTerms, CriteriaTerm } from './criteria-specific-terms';

export class Top10AccordingTo extends ClonerMixin(GetNamesMixin(class {})) {
  id!: number;
  url!: string;

  disabled = false;
  hasPrice = false;
  hasSqUnit = false;

  criteriaTerms: CriteriaSpecificTerms;

  private _unitsService: UnitsService;

  constructor(terms: CriteriaTerm[] = []) {
    super();
    this.criteriaTerms = new CriteriaSpecificTerms(terms);
    this._unitsService = ServiceRegistry.get<UnitsService>('UnitsService');
  }

  override getNames(): string {
    let _name = super.getNames();
    if (this.hasSqUnit) _name += ' "' + this._unitsService.selectedUnitInfo().getNames() + '"';
    return _name;
  }
}

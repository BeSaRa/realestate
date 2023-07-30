import { GetNamesMixin } from '@mixins/get-names-mixin';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { KpiRootContract } from '@contracts/kpi-root-contract';

export class KpiRoot extends ClonerMixin(GetNamesMixin(class {})) implements KpiRootContract {
  value = 79797;
  imageUrl?: string;
  yoy = 0;
  selected = false;

  constructor(
    public id: number,
    public override arName: string,
    public override enName: string,
    public hasPrice = false,
    public url: string,
    public subUrl?: string,
    public secondSubUrl?: string
  ) {
    super();
  }

  setSelected(selected: boolean): this {
    this.selected = selected;
    return this;
  }

  setYoy(yoy: number): this {
    this.yoy = yoy;
    return this;
  }

  toggleSelect() {
    this.selected = !this.selected;
  }
}

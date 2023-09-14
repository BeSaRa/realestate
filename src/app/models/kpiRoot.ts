import { GetNamesMixin } from '@mixins/get-names-mixin';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { KpiRootContract } from '@contracts/kpi-root-contract';

export class KpiRoot extends ClonerMixin(GetNamesMixin(class {})) implements KpiRootContract {
  value = 79797;
  imageUrl?: string;
  yoy = 0;
  selected = false;
  year!: number;

  constructor(
    public id: number,
    public override arName: string,
    public override enName: string,
    public hasPrice = false,
    public url: string,
    public subUrl?: string,
    public secondSubUrl?: string,
    public chartDataUrl?: string,
    public iconUrl: string = 'assets/icons/kpi/1.png'
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

  setValue(value: number): this {
    this.value = value;
    return this;
  }

  setYear(year: number): this {
    this.year = year;
    return this;
  }

  toggleSelect() {
    this.selected = !this.selected;
  }
}

import { ClonerMixin } from '@mixins/cloner-mixin';
import { GetNamesMixin } from '@mixins/get-names-mixin';

export class Top10AccordingTo extends ClonerMixin(GetNamesMixin(class {})) {
  id!: number;
  url!: string;

  disabled = false;
  hasPrice = false;
}

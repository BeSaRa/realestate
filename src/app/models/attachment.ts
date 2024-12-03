import { ClonerMixin } from '@mixins/cloner-mixin';

export class Attachment extends ClonerMixin(class {}) {
  declare id: string;
  declare title: string;
  declare folder?: string;
  declare file: File;
}

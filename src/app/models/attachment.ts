import { ClonerMixin } from '@mixins/cloner-mixin';
import { generateUUID } from '@utils/utils';

export class Attachment extends ClonerMixin(class {}) {
  declare id: string;
  declare title: string;
  declare folder?: string;
  declare file: File;
  declare description: string;

  constructor(assignId = false) {
    super();
    if (assignId) {
      this.id = generateUUID();
    }
  }
}

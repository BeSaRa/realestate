import { ClonerMixin } from '@mixins/cloner-mixin';

export class MainMenu extends ClonerMixin(class {}) {
    id!: number;
    key!: string;
    title!: string;
    status!: boolean;
    items!: any[];
}

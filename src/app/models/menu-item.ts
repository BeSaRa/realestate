import { HasServiceNameContract } from '@contracts/has-service-name-contract';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { GetNamesMixin } from '@mixins/get-names-mixin';
import { HasServiceMixin } from '@mixins/has-service-mixin';
import { MenuService } from '@services/menu.service';

export class MenuItem extends HasServiceMixin(ClonerMixin(GetNamesMixin(class {}))) implements HasServiceNameContract {
  id!: number;
  override $$__service_name__$$ = 'MenuService';
  status!: boolean;
  url!: string;
  clicks!: string;
  menu_id!: number;
  is_authenticated!: boolean;
  isIndicatorPage!: boolean;
  recent = false;
  roles: string[] = [];

  datasource_message_id!: { id: number; arMessage: string; enMessage: string } | null;

  clicked() {
    return this.$$getService$$<MenuService>().updateClicks(this);
  }

  isExternal() {
    return this.url === '/laws' || this.url === '/news';
  }

  getExternalUrl() {
    return this.$$getService$$<MenuService>().getExternalUrl(this.url);
  }
}

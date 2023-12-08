import { BaseModel } from '@abstracts/base-model';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { HomeSliderService } from '@services/home-slider.service';
import { ServiceRegistry } from '@services/service-registry';
import { TranslationService } from '@services/translation.service';

export class HomeSlider extends ClonerMixin(BaseModel<HomeSliderService>) {
  $$__service_name__$$ = 'HomeSliderService';
  arTitle!: string;
  enTitle!: string;
  value!: string;
  hasPrice!: boolean;

  private _langService = ServiceRegistry.get<TranslationService>('TranslationService');

  getTitle() {
    return this._langService.isLtr ? this.enTitle : this.arTitle;
  }
}

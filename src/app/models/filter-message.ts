import { ServiceRegistry } from '@services/service-registry';
import { TranslationService } from '@services/translation.service';

export class FilterMessage {
  id!: number;
  arMessage!: string;
  enMessage!: string;

  private _lang = ServiceRegistry.get<TranslationService>('TranslationService');

  getMessage() {
    return this._lang.isLtr ? this.enMessage : this.arMessage;
  }
}

import { NamesContract } from '@contracts/names-contract';
import { TranslationService } from '@services/translation.service';

export interface GetNamesContract extends NamesContract {
  getNames(): string;

  getLangService(): TranslationService;
}

import { AbstractConstructor, Constructor } from '@app-types/constructors';
import { GetNamesContract } from '@contracts/get-names-contract';
import { ServiceRegistry } from '@services/service-registry';
import { NamesContract } from '@contracts/names-contract';
import { TranslationService } from '@services/translation.service';

type CanGetNames = Constructor<GetNamesContract> & AbstractConstructor<GetNamesContract>;

export function GetNamesMixin<T extends AbstractConstructor<object>>(base: T): CanGetNames & T;
export function GetNamesMixin<T extends Constructor<object>>(base: T): CanGetNames & T {
  return class CanGetNames extends base implements GetNamesContract {
    arName!: string;
    enName!: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(args);
    }

    getLangService(): TranslationService {
      return ServiceRegistry.get<TranslationService>('TranslationService');
    }

    getNames(): string {
      try {
        return this[(this.getLangService().getCurrent().code.split('-').shift() + 'Name') as keyof NamesContract];
      } catch (e) {
        return 'lang service not ready yet';
      }
    }
  };
}

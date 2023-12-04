import { ClonerMixin } from '@mixins/cloner-mixin';
import { ServiceRegistry } from '@services/service-registry';
import { TranslationService } from '@services/translation.service';

export class Broker extends ClonerMixin(class {}) {
  brokerArName!: string;
  brokerEnName!: string;
  brokerArDescription!: string;
  brokerEnDescription!: string;
  managerArName!: string;
  managerEnName!: string;
  brokerEmail!: string;
  brokerIcon!: string;
  brokerPhone1!: string;
  brokerPhone2!: string;
  brokerPhone3!: string;
  brokerlicenseNumber!: string;
  isActive!: true;
  brokerCategoryId!: number;
  brokerTypeId!: number;
  municipalityId!: number;

  private _langService: TranslationService;

  constructor() {
    super();
    this._langService = ServiceRegistry.get<TranslationService>('TranslationService');
  }

  getCompanyName(): string {
    return this._langService.isLtr ? this.brokerEnName : this.brokerArName;
  }

  getDescription(): string {
    return this._langService.isLtr ? this.brokerEnDescription : this.brokerArDescription;
  }

  getManagerName(): string {
    return this._langService.isLtr ? this.managerEnName : this.managerArName;
  }

  validateFilter(name: string) {
    if (!name) return true;

    return (
      this.brokerArName?.includes(name) || this.brokerEnName?.toLowerCase().includes(name.toLowerCase())
      // || this.managerArName?.includes(name) ||
      // this.managerEnName?.includes(name)
    );
  }
}

import { HasServiceMixin } from '@mixins/has-service-mixin';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { CloneContract } from '@contracts/clone-contract';
import { HasServiceNameContract } from '@contracts/has-service-name-contract';
import { BaseModelContract } from '@contracts/base-model-contract';

export abstract class BaseModel<ServiceType, PrimaryType = number>
  extends HasServiceMixin(ClonerMixin(class {}))
  implements CloneContract, HasServiceNameContract, BaseModelContract<PrimaryType>
{
  abstract override $$__service_name__$$: string;
  id!: PrimaryType;
  date_created!: string;
  date_updated!: string;
  sort!: string;
  user_created!: string;
  user_updated!: string;

  getService() {
    return this.$$getService$$<ServiceType>();
  }
}

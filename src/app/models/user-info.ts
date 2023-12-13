import { HasServiceMixin } from '@mixins/has-service-mixin';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { InterceptModel } from 'cast-response';
import { UserInfoInterceptor } from '@model-interceptors/user-info-interceptor';
import { Role } from '@models/role';
import { CustomValidators } from '@validators/custom-validators';

const { send, receive } = new UserInfoInterceptor();

@InterceptModel({ send, receive })
export class UserInfo extends HasServiceMixin(ClonerMixin(class {})) {
  id!: string;
  title!: string;
  first_name!: string;
  last_name!: string;
  email!: string;
  language!: string;
  email_notifications!: boolean;
  location?: string;
  description?: string;
  tags?: string;
  status?: string;
  last_access?: string;
  last_page?: string;
  provider?: string;
  external_identifier?: string;
  role!: Role;

  buildForm(): object {
    const { id, title, first_name, last_name, email, language, email_notifications } = this;

    return {
      id: id,
      title: [title, [CustomValidators.maxLength(50)]],
      first_name: [first_name, [CustomValidators.maxLength(50)]],
      last_name: [last_name, [CustomValidators.maxLength(50)]],
      email: [email, [CustomValidators.pattern('EMAIL'), CustomValidators.maxLength(50)]],
      language: language,
      email_notifications: email_notifications ?? false,
    };
  }
}

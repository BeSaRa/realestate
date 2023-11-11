import { HasServiceMixin } from '@mixins/has-service-mixin';
import { UserRole } from './user-role';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { ServiceRegistry } from '@services/service-registry';
import { TranslationService } from '@services/translation.service';
import { InterceptModel } from 'cast-response';
import { UserInfoInterceptor } from '@model-interceptors/user-info-interceptor';

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
  role?: UserRole;

  buildForm(): object {
    const { id, title, first_name, last_name, email, language, email_notifications } = this;

    return {
      id: id,
      title: title,
      first_name: first_name,
      last_name: last_name,
      email: email,
      language: language,
      email_notifications: email_notifications ?? false,
    };
  }
}

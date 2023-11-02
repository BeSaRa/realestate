import { UserInfo } from '@models/user-info';
import { ServiceRegistry } from '@services/service-registry';
import { TranslationService } from '@services/translation.service';
import { ModelInterceptorContract } from 'cast-response';

export class UserInfoInterceptor implements ModelInterceptorContract<UserInfo> {
    receive(model: UserInfo): UserInfo {
        const langService = ServiceRegistry.get('TranslationService') as TranslationService;
        model.language = model.language ?? langService.getCurrent().code;
        return model;
    }

    send(model: Partial<UserInfo>): Partial<UserInfo> {
        return model;
    }
}
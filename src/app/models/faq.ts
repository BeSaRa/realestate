import { BaseModel } from '@abstracts/base-model';
import { FaqInterceptor } from '@model-interceptors/faq-interceptor';
import { FaqService } from '@services/faq.service';
import { InterceptModel } from 'cast-response';

const { send, receive } = new FaqInterceptor();

@InterceptModel({ send, receive })
export class Faq extends BaseModel<FaqService> {
  $$__service_name__$$ = 'FaqService';
  answer!: string;
  question!: string;
}

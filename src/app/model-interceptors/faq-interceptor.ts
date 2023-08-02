import { Faq } from '@models/faq';
import { ModelInterceptorContract } from 'cast-response';

export class FaqInterceptor implements ModelInterceptorContract<Faq> {
  receive(model: Faq): Faq {
    return model;
  }

  send(model: Partial<Faq>): Partial<Faq> {
    return model;
  }
}

import { ModelInterceptorContract } from 'cast-response';
import { Law } from '@models/law';

export class LawInterceptor implements ModelInterceptorContract<Law> {
  receive(model: Law): Law {
    model.fileUrl = model.getService().loadFile(model.file);
    return model;
  }

  send(model: Partial<Law>): Partial<Law> {
    return model;
  }
}

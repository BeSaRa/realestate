import { ModelInterceptorContract } from 'cast-response';
import { Law } from '@models/law';

export class NewsInterceptor implements ModelInterceptorContract<Law> {
  receive(model: Law): Law {
    model.fileUrl = model.getService().loadFile(model.file);
    return model;
  }

  send(model: Partial<Law>): Partial<Law> {
    return model;
  }
}

import { ModelInterceptorContract } from 'cast-response';
import { News } from '@models/news';

export class NewsInterceptor implements ModelInterceptorContract<News> {
  receive(model: News): News {
    model.imageUrl = model.getService().loadFile(model.image);
    return model;
  }

  send(model: Partial<News>): Partial<News> {
    return model;
  }
}

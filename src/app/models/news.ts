import { BaseModel } from '@abstracts/base-model';
import { NewsService } from '@services/news.service';
import { InterceptModel } from 'cast-response';
import { NewsInterceptor } from '@model-interceptors/news-interceptor';

const { send, receive } = new NewsInterceptor();

@InterceptModel({ send, receive })
export class News extends BaseModel<NewsService> {
  $$__service_name__$$ = 'NewsService';
  title!: string;
  excerpt!: string;
  content!: string;
  status!: string;
  image!: string;
  imageUrl!: string;
  tags!: string[];
}

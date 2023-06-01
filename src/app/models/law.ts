import { BaseModel } from '@abstracts/base-model';
import { LawInterceptor } from '@model-interceptors/law-interceptor';
import { LawService } from '@services/law.service';
import { InterceptModel } from 'cast-response';

const { send, receive } = new LawInterceptor();

@InterceptModel({ send, receive })
export class Law extends BaseModel<LawService> {
  $$__service_name__$$ = 'LawService';
  title!: string;
  issue_date!: string;
  law_number!: string;
  file!: string;
  fileUrl!: string;
}

import { News } from '@models/news';
import { Survey } from '@models/survey';
import { Page } from '@models/page';

export interface DirectusSchemaContract {
  news: News[];
  surveys: Survey[];
  about: Page;
}

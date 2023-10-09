import { News } from '@models/news';
import { Survey } from '@models/survey';
import { Page } from '@models/page';
import { VoteHistory } from '@models/vote-history';

export interface DirectusSchemaContract {
  news: News[];
  surveys: Survey[];
  about: Page;
  vote_history: VoteHistory[];
}

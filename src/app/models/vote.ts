import { VoteItem } from './vote-item';

export class Vote {
  id!: number;
  title!: string;
  is_main!: boolean;
  vote_items!: VoteItem[];
  voted!: boolean;
}

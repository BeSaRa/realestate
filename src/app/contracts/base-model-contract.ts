export interface BaseModelContract<PrimaryType = number> {
  id: PrimaryType;
  date_created: string;
  date_updated: string;
  sort: string;
  user_created: string;
  user_updated: string;
}

import { ClonerMixin } from '@mixins/cloner-mixin';

export class InterestRegistration extends ClonerMixin(class {}) {
  id!: number;
  date_created!: string;
  full_name!: string;
  passport_number!: string;
  email!: string;
  phone!: string;
  category_id!: number;
  is_interested_in_buying_apartment!: boolean;
  apartment_type_id!: number | null;
  area_from!: number;
  area_to!: number;
  price_from!: number;
  price_to!: number;
  visited_qatar_before!: boolean;
  interested_moving_investing_in_qatar!: boolean;
  need_more_information!: boolean;
  exhibit_id!: number;
}

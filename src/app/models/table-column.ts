import { SecurityType } from '@enums/security-type';

export class TableColumn {
  id!: number;
  security!: SecurityType;
  column_name!: string;
  hide!: boolean;
  roles!: string[];
  users!: string[];
}

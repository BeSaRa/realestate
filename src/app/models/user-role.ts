export class UserRole {
  id!: string;
  name!: string;
  icon!: string;
  description!: string;
  ip_access!: string;
  enforce_tfa!: boolean;
  admin_access!: boolean;
  app_access!: boolean;
  users!: string[];
}

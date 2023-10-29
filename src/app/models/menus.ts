import { MenusContract } from '@contracts/menus-contract';
import { Menu } from './menu';
import { MenuItem } from '@models/menu-item';

export class Menus implements MenusContract {
  main_menu!: Menu;
  recent!: MenuItem[];
}

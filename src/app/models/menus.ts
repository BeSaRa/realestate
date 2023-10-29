import { MenusContract } from '@contracts/menus-contract';
import { Menu } from './menu';

export class Menus implements MenusContract {
  main_menu!: Menu;
}

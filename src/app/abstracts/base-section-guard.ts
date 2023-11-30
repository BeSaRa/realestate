import { SecurityType } from '@enums/security-type';
import { ClonerMixin } from '@mixins/cloner-mixin';
import { ServiceRegistry } from '@services/service-registry';
import { UserService } from '@services/user.service';

export abstract class BaseSectionGuard extends ClonerMixin(class {}) {
  id!: number;
  security!: SecurityType;
  hide!: boolean;
  roles!: string[];
  users!: string[];

  private _userService = ServiceRegistry.get<UserService>('UserService');

  isHidden(): boolean {
    if (this.hide) return true;

    if (this.security === SecurityType.PER_ROLE) {
      return !this._checkUserRole();
    }

    if (this.security === SecurityType.PER_USER) {
      return !this._checkUser();
    }

    if (this.security === SecurityType.BOTH) {
      return !this._checkUser() || !this._checkUserRole();
    }

    return false;
  }

  private _checkUserRole() {
    return this.roles.length
      ? this._userService.currentUser
        ? this.roles.includes(this._userService.currentUser.role.id)
        : false
      : true;
  }

  private _checkUser() {
    return this.users.length
      ? this._userService.currentUser
        ? this.users.includes(this._userService.currentUser.id)
        : false
      : true;
  }
}

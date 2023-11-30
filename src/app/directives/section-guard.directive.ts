import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { AuthService } from '@services/auth.service';
import { SectionGuardService } from '@services/section-guard.service';
import { UserService } from '@services/user.service';
import { takeUntil } from 'rxjs';

@Directive({
  selector: '[appSectionGuard]',
  standalone: true,
})
export class SectionGuardDirective extends OnDestroyMixin(class {}) implements OnInit {
  private _viewConatainerRef = inject(ViewContainerRef);
  private _templateRef = inject(TemplateRef);
  private _sectionGuardService = inject(SectionGuardService);
  private _userService = inject(UserService);

  private _context = { $implicit: '' };

  @Input({ required: true }) set appSectionGuard(sectionName: string) {
    this._context.$implicit = sectionName;
    this._updateView();
  }

  ngOnInit(): void {
    this._userService.userInfoChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this._updateView();
    });
  }

  private _updateView() {
    this._viewConatainerRef.clear();
    if (this._sectionGuardService.isSectionHidden(this._context.$implicit)) return;
    this._viewConatainerRef.createEmbeddedView(this._templateRef, this._context);
  }
}

import { Directive, EmbeddedViewRef, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
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
  private _viewRef?: EmbeddedViewRef<typeof this._context>;

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
    if (this._sectionGuardService.isSectionHidden(this._context.$implicit)) {
      this._viewConatainerRef.clear();
      this._viewRef = undefined;
      return;
    }
    if (this._viewRef) return;
    this._viewRef = this._viewConatainerRef.createEmbeddedView(this._templateRef, this._context);
  }
}

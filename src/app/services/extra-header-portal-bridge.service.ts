import { TemplatePortal } from '@angular/cdk/portal';
import { Injectable, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExtraHeaderPortalBridgeService {
  private _router = inject(Router);

  private portalSubject = new BehaviorSubject<TemplatePortal | undefined>(undefined);
  readonly portal$ = this.portalSubject.asObservable();

  private subTitleSubject = new BehaviorSubject<string | undefined>(undefined);
  readonly subTitle$ = this.subTitleSubject.asObservable();

  constructor() {
    this._listenToRouteChange();
  }

  setSubTitle(subTitle?: string) {
    this.subTitleSubject.next(subTitle);
  }

  setPortal(templateRef: TemplateRef<any> | undefined | null, viewRef: ViewContainerRef) {
    if (templateRef) this.portalSubject.next(new TemplatePortal(templateRef, viewRef));
    else this.portalSubject.next(undefined);
  }

  _listenToRouteChange() {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.subTitleSubject.next(undefined);
        this.portalSubject.next(undefined);
      }
    });
  }
}

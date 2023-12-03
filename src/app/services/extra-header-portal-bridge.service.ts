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

  constructor() {
    this._listenToRouteChange();
  }

  setPortal(templateRef: TemplateRef<any>, viewRef: ViewContainerRef) {
    this.portalSubject.next(new TemplatePortal(templateRef, viewRef));
  }

  _listenToRouteChange() {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.portalSubject.next(undefined);
    });
  }
}

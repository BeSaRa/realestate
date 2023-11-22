import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  router = inject(Router);
  dialog = inject(DialogService);

  private _isOpened = signal(false);

  isOpened = computed(() => this._isOpened());
  isOpenTriggered = false;

  constructor() {
    this._listenToRouteChange();
    this._listenToDialogOpened();
  }

  open() {
    this.isOpenTriggered = true;
    this._isOpened.set(true);
  }

  close() {
    this.isOpenTriggered = false;
    this._isOpened.set(false);
  }

  private _listenToRouteChange() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.close();
      }
    });
  }

  private _listenToDialogOpened() {
    this.dialog.afterDialogOpened$.subscribe(() => this.close());
  }
}

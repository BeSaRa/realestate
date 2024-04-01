import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeWhile } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SplashService {
  router = inject(Router);
  document = inject(DOCUMENT);

  private _isShown = true;

  private _splashScreen = document.getElementById('splash-screen');

  constructor() {
    this.document.body.classList.add('overflow-hidden', 'h-full', 'm-0');
    this._listenToFirstRouteEnd();
  }

  private _listenToFirstRouteEnd() {
    this.router.events.pipe(takeWhile(() => this._isShown)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.removeSplash();
      }
    });
  }

  showSplash() {
    if (this._isShown) return;
    this._isShown = true;
    if (this._splashScreen) {
      this._splashScreen?.classList.remove('removed');
      this.document.body.appendChild(this._splashScreen);
      this.document.body.classList.add('overflow-hidden', 'h-full', 'm-0');
    }
  }

  removeSplash() {
    if (!this._isShown) return;
    this._isShown = false;
    if (this._splashScreen) {
      this._splashScreen.classList.add('removed');
      setTimeout(() => {
        this.document.body.removeChild(this._splashScreen!);
        this.document.body.classList.remove('overflow-hidden', 'h-full', 'm-0');
      }, 500);
    }
  }
}

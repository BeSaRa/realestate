import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeWhile } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SplashService {
  router = inject(Router);

  private _isShown = true;

  private _splashScreen = document.getElementById('splash-screen');

  constructor() {
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
      document.body.appendChild(this._splashScreen);
    }
  }

  removeSplash() {
    if (!this._isShown) return;
    this._isShown = false;
    if (this._splashScreen) {
      this._splashScreen.classList.add('removed');
      setTimeout(() => {
        document.body.removeChild(this._splashScreen!);
      }, 500);
    }
  }
}

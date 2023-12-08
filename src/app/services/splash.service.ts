import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeWhile } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SplashService {
  router = inject(Router);

  private _isShown = true;

  constructor() {
    this._listenToFirstRouteEnd();
  }

  private _listenToFirstRouteEnd() {
    this.router.events.pipe(takeWhile(() => this._isShown)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._isShown = false;
        this.removeSplash();
      }
    });
  }

  removeSplash() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
      splashScreen.classList.add('removed');
      setTimeout(() => {
        document.body.removeChild(splashScreen);
      }, 500);
    }
  }
}

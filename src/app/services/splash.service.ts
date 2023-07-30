import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SplashService {
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

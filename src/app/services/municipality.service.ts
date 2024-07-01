import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MunicipalityService {
  private _router = inject(Router);
  private _municipalityChanged = new BehaviorSubject<number>(-1);

  municipalityChanged$ = this._municipalityChanged.asObservable();

  constructor() {
    this._listenToRouteChange();
  }

  emitMunicipalityChangeFromChart(municipalityId: number) {
    this._municipalityChanged.next(municipalityId);
  }

  private _listenToRouteChange() {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._municipalityChanged.next(-1);
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MunicipalityService {
  private _municipalityChanged = new BehaviorSubject<number>(-1);

  municipalityChanged$ = this._municipalityChanged.asObservable();

  emitMunicipalityChangeFromChart(municipalityId: number) {
    this._municipalityChanged.next(municipalityId);
  }
}

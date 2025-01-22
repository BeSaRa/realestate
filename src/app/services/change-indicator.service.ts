import { computed, Injectable, signal } from '@angular/core';
import { ChangeIndicatorType } from '@enums/change-indicator-types';
import { Durations } from '@enums/durations';

@Injectable({
  providedIn: 'root',
})
export class ChangeIndicatorService {
  private _changeIndicatorType = signal<ChangeIndicatorType>(ChangeIndicatorType.YOY);
  changeIndicatorType = computed(() => this._changeIndicatorType());

  setChangeIndicatorType(durationType: Durations, year: number, month: number) {
    const _isCurrentDate = this._isCurrentDate(new Date(year, month - 1));
    switch (durationType) {
      case Durations.YEARLY:
        this._changeIndicatorType.set(_isCurrentDate ? ChangeIndicatorType.YTD : ChangeIndicatorType.YOY);
        break;
      case Durations.HALF_YEARLY:
        this._changeIndicatorType.set(_isCurrentDate ? ChangeIndicatorType.HTD : ChangeIndicatorType.HOH);
        break;
      case Durations.QUARTER_YEARLY:
        this._changeIndicatorType.set(_isCurrentDate ? ChangeIndicatorType.QTD : ChangeIndicatorType.QOQ);
        break;
      case Durations.MONTHLY:
        this._changeIndicatorType.set(_isCurrentDate ? ChangeIndicatorType.MTD : ChangeIndicatorType.MOM);
        break;
      default:
        this._changeIndicatorType.set(ChangeIndicatorType.YOY);
    }
  }

  private _isCurrentDate(date: Date) {
    const _now = new Date(Date.now());
    return date.getFullYear() === _now.getFullYear() && date.getMonth() >= _now.getMonth();
  }
}

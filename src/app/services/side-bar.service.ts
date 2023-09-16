import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  private _isOpened = signal(false);

  isOpened = computed(() => this._isOpened());

  open() {
    this._isOpened.set(true);
  }

  close() {
    this._isOpened.set(false);
  }
}

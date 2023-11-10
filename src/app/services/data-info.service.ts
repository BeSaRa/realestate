import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LangKeysContract } from '@contracts/lang-keys-contract';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class DataInfoService {
  private _isEnabledSignal = signal(false);
  private _infoIconUrlSignal = signal('assets/icons/info/info.svg');

  private _arText = '';
  private _enText = '';

  lang = inject(TranslationService);
  router = inject(Router);

  isEnabled = computed(() => this._isEnabledSignal());
  infoIconUrl = computed(() => this._infoIconUrlSignal());

  constructor() {
    this._listenToRouteChange();
  }

  setEnabled(isEnabled: boolean) {
    this._isEnabledSignal.set(isEnabled);
  }

  setInfoIconUrl(url: string) {
    this._infoIconUrlSignal.set(url);
  }

  setText(langKey: keyof LangKeysContract) {
    this._arText = this.lang.getArabicTranslation(langKey);
    this._enText = this.lang.getEnglishTranslation(langKey);
  }

  getText() {
    return this.lang.isLtr ? this._enText : this._arText;
  }

  private _listenToRouteChange() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._isEnabledSignal.set(false);
      }
    });
  }
}

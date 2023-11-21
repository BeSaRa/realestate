import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { MenuService } from './menu.service';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class DataInfoService {
  private _infoIconUrlSignal = signal('assets/icons/info/info.svg');

  router = inject(Router);
  menuService = inject(MenuService);
  lang = inject(TranslationService);

  private _text!: { arMessage: string; enMessage: string } | null;

  infoIconUrl = computed(() => this._infoIconUrlSignal());

  constructor() {
    this._listenToRouteChange();
  }

  setInfoIconUrl(url: string) {
    this._infoIconUrlSignal.set(url);
  }

  getText() {
    return this._text && (this.lang.isLtr ? this._text.enMessage : this._text.arMessage);
  }

  private _listenToRouteChange() {
    combineLatest([this.menuService.menuMap$, this.router.events]).subscribe(([menus, event]) => {
      if (event instanceof NavigationEnd) {
        this._text = menus[(event as NavigationEnd).url]?.datasource_message_id ?? null;
      }
    });
  }
}

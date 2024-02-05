import { Injectable, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { NavigationEnd, Router } from '@angular/router';
import { combineLatest, filter, tap } from 'rxjs';
import { IndicatorsRoutes } from '@enums/indicators-routes';
import { LookupService } from './lookup.service';
import { Lookup } from '@models/lookup';
import { LangContract } from '@contracts/lang-contract';

@Injectable({
  providedIn: 'root',
})
export class DistrictSortService {
  lang = inject(TranslationService);
  router = inject(Router);
  lookupService = inject(LookupService);

  private _currentUrl = '';

  constructor() {}

  listenToRouteAndLangChange() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        tap((event) => (this._currentUrl = (event as NavigationEnd).url))
      )
      .subscribe(this._sortDistricts);
    this.lang.change$.subscribe(this._sortDistricts);
  }

  private _sortDistricts = () => {
    if (this.lang.getCurrent().direction === 'ltr') {
      if (this._currentUrl === IndicatorsRoutes.SELL) {
        this.lookupService.sellLookups?.districtList?.sort(this._enCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.RENTAL) {
        this.lookupService.rentLookups?.zoneList?.sort(this._enCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.MORTGAGE) {
        this.lookupService.mortLookups?.districtList?.sort(this._enCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.OWNERSHIP) {
        this.lookupService.ownerLookups?.districtList?.sort(this._enCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.OCCUPIED_AND_VACANT) {
        this.lookupService.ovLookups?.zoneList?.sort(this._enCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.FORECASTING) {
        this.lookupService.sellLookups?.districtList?.sort(this._enCompare);
        this.lookupService.rentLookups?.zoneList?.sort(this._enCompare);
      }
    } else {
      if (this._currentUrl === IndicatorsRoutes.SELL) {
        this.lookupService.sellLookups?.districtList?.sort(this._arCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.RENTAL) {
        this.lookupService.rentLookups?.zoneList?.sort(this._arCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.MORTGAGE) {
        this.lookupService.mortLookups?.districtList?.sort(this._arCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.OWNERSHIP) {
        this.lookupService.ownerLookups?.districtList?.sort(this._arCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.OCCUPIED_AND_VACANT) {
        this.lookupService.ovLookups?.zoneList?.sort(this._arCompare);
      }
      if (this._currentUrl === IndicatorsRoutes.FORECASTING) {
        this.lookupService.sellLookups?.districtList?.sort(this._arCompare);
        this.lookupService.rentLookups?.zoneList?.sort(this._arCompare);
      }
    }
  };

  private _enCompare = (a: Lookup, b: Lookup) => {
    if (a.enName > b.enName) {
      return 1;
    }
    if (b.enName > a.enName) {
      return -1;
    }
    return 0;
  };

  private _arCompare = (a: Lookup, b: Lookup) => {
    if (a.arName > b.arName) {
      return 1;
    }
    if (b.arName > a.arName) {
      return -1;
    }
    return 0;
  };
}

import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FavouritesPopupComponent } from '@components/favourites-popup/favourites-popup.component';
import { IndicatorType } from '@components/transactions-filter/transactions-filter.component';
import { CriteriaContract } from '@contracts/criteria-contract';
import { LookupsContract } from '@contracts/lookups-contract';
import { IndicatorsRoutes } from '@enums/indicators-routes';
import { Lookup } from '@models/lookup';
import { UserWishList, UserWishListResponse } from '@models/user-wish-list';
import { CastResponse } from 'cast-response';
import { map } from 'rxjs';
import { DialogService } from './dialog.service';
import { LookupService } from './lookup.service';
import { UrlService } from './url.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class FavouritesService {
  private _lookupService = inject(LookupService);
  private _dialog = inject(DialogService);
  private _userService = inject(UserService);
  private _http = inject(HttpClient);
  private _urlService = inject(UrlService);
  private _router = inject(Router);

  private _appliedCriteria = signal<undefined | CriteriaContract>(undefined);
  appliedCriteria = computed(() => this._appliedCriteria());
  private _isApplying = false;

  constructor() {
    this._listenToRouteChange();
  }

  applyCriteria(criteria: CriteriaContract, page: IndicatorsRoutes) {
    this._isApplying = true;
    this._appliedCriteria.set(criteria);
    this._router.navigate([page]);
  }

  private _listenToRouteChange() {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!this._isApplying) this._appliedCriteria.set(undefined);
        this._isApplying = false;
      }
    });
  }

  openFavouritesPopup() {
    this._dialog.open(FavouritesPopupComponent, { minWidth: '60vw', maxWidth: '95vw' });
  }

  @CastResponse(() => UserWishListResponse)
  saveCriteria(wishlist: Partial<UserWishListResponse>) {
    return this._http.post<UserWishListResponse>(this._urlService.URLS.WISHLIST, {
      ...wishlist,
      userId: this._userService.currentUser?.id,
    });
  }

  @CastResponse(() => UserWishListResponse)
  updateCriteria(wishlist: Partial<UserWishListResponse>) {
    return this._http.put<UserWishListResponse>(this._urlService.URLS.WISHLIST, wishlist);
  }

  @CastResponse(() => UserWishListResponse)
  private _loadUserWishlist() {
    return this._http.get<UserWishListResponse[]>(
      this._urlService.URLS.USER_WISHLIST + `/${this._userService.currentUser?.id}`
    );
  }

  loadUserWishlist() {
    return this._loadUserWishlist().pipe(
      map((wishlists) =>
        wishlists.map((item) =>
          new UserWishList().clone<UserWishList>({
            ...item,
            criteria: JSON.parse(item.criteria) as CriteriaContract,
          })
        )
      )
    );
  }

  deleteItemFromWishlist(item: UserWishList) {
    return this._http.delete<boolean>(this._urlService.URLS.WISHLIST + `/${item.id}`);
  }

  getLookupsMap(indicatorType: IndicatorType, criteriaKey: keyof CriteriaContract) {
    return CriteriaToLookup[criteriaKey]
      ? this._getIndicatorLookupsMap(indicatorType, CriteriaToLookup[criteriaKey])
      : undefined;
  }

  private _getIndicatorLookupsMap(indicatorType: IndicatorType, lookups: keyof LookupsContract) {
    return this._convertListToMap((this._getIndicatorLookups(indicatorType)?.[lookups] as Lookup[]) ?? []);
  }

  private _convertListToMap(list: Lookup[]) {
    if (!list.length) return undefined;
    return list.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {} as Record<number, Lookup>);
  }

  private _getIndicatorLookups(indicatorType: IndicatorType) {
    if (indicatorType === 'mortgage') return this._lookupService['mortLookups'];
    return this._lookupService[(indicatorType + 'Lookups') as keyof LookupService] as LookupsContract;
  }
}

export const indicatorRouteToType = {
  [IndicatorsRoutes.SELL]: 'sell',
  [IndicatorsRoutes.RENTAL]: 'rent',
  [IndicatorsRoutes.MORTGAGE]: 'mortgage',
  [IndicatorsRoutes.OWNERSHIP]: 'owner',
  [IndicatorsRoutes.OCCUPIED_AND_VACANT]: 'ov',
  // [IndicatorsRoutes.BROKERS]: 'broker',
  [IndicatorsRoutes.GENERAL_SECRETARIAT]: 'rent',
} as Record<IndicatorsRoutes, IndicatorType>;

export const CriteriaToLookup = {
  municipalityId: 'municipalityList',
  areaCode: 'districtList',
  zoneId: 'zoneList',
  propertyTypeList: 'propertyTypeList',
  purposeList: 'rentPurposeList',
  ['serviceType' as keyof CriteriaContract]: 'serviceTypeList',
  ['occupancyStatus' as keyof CriteriaContract]: 'occupancyStatusList',
  ['premiseCategoryList' as keyof CriteriaContract]: 'premiseCategoryList',
  ['premiseTypeList' as keyof CriteriaContract]: 'premiseTypeList',

  ['ownerCategoryCode' as keyof CriteriaContract]: 'ownerCategoryList',
  nationalityCode: 'nationalityList',
  ['bedRoomsCount' as keyof CriteriaContract]: 'rooms',
  ['furnitureStatus' as keyof CriteriaContract]: 'furnitureStatusList',
  ['brokerCategoryId' as keyof CriteriaContract]: 'brokerCategoryList',

  // not related with CriteriaContract but used for saving criteria purpose
  ['durationType' as keyof CriteriaContract]: 'durations',
  ['issueDateYear' as keyof CriteriaContract]: 'year',
  ['halfYearDuration' as keyof CriteriaContract]: 'halfYearDurations',
  ['issueDateQuarterList' as keyof CriteriaContract]: 'quarterYearDurations',
  ['issueDateMonth' as keyof CriteriaContract]: 'month',

  ['unit' as keyof CriteriaContract]: 'unit',
} as Record<keyof CriteriaContract, keyof LookupsContract>;

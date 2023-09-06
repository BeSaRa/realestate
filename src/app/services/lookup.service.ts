import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LookupsContract } from '@contracts/lookups-contract';
import { ServiceContract } from '@contracts/service-contract';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { Lookup } from '@models/lookup';
import { LookupsMap } from '@models/lookups-map';
import { UrlService } from '@services/url.service';
import { CastResponse } from 'cast-response';
import { forkJoin, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LookupService extends RegisterServiceMixin(class {}) implements ServiceContract {
  serviceName = 'LookupService';
  urlService = inject(UrlService);
  http = inject(HttpClient);

  rentLookups!: LookupsContract;
  sellLookups!: LookupsContract;
  mortLookups!: LookupsContract;

  rentMunicipalitiesMap: Record<number, Lookup> = {};
  sellMunicipalitiesMap: Record<number, Lookup> = {};
  mortMunicipalitiesMap: Record<number, Lookup> = {};

  rentZonesMap: Record<number, Lookup> = {};
  sellZonesMap: Record<number, Lookup> = {};
  mortZonesMap: Record<number, Lookup> = {};

  rentRoomsMap: Record<number, Lookup> = {};
  rentFurnitureMap: Record<number, Lookup> = {};

  rentPurposeMap: Record<number, Lookup> = {};
  sellPurposeMap: Record<number, Lookup> = {};
  mortPurposeMap: Record<number, Lookup> = {};

  rentPropertyTypeMap: Record<number, Lookup> = {};
  sellPropertyTypeMap: Record<number, Lookup> = {};
  mortPropertyTypeMap: Record<number, Lookup> = {};

  sellDistrictMap: Record<number, Lookup> = {};
  rentDistrictMap: Record<number, Lookup> = {};
  mortDistrictMap: Record<number, Lookup> = {};

  @CastResponse(() => LookupsMap, {
    shape: {
      'districtList.*': () => Lookup,
      'propertyTypeList.*': () => Lookup,
      'rentPurposeList.*': () => Lookup,
      'zoneList.*': () => Lookup,
      'municipalityList.*': () => Lookup,
      'furnitureStatusList.*': () => Lookup,
      'nationalityList.*': () => Lookup,
    },
  })
  _loadRentLookups(): Observable<LookupsMap> {
    return this.http.get<LookupsMap>(this.urlService.URLS.RENT_LOOKUPS);
  }

  @CastResponse(() => LookupsMap, {
    shape: {
      'districtList.*': () => Lookup,
      'propertyTypeList.*': () => Lookup,
      'rentPurposeList.*': () => Lookup,
      'zoneList.*': () => Lookup,
      'municipalityList.*': () => Lookup,
      'nationalityList.*': () => Lookup,
    },
  })
  _loadSellLookups(): Observable<LookupsMap> {
    return this.http.get<LookupsMap>(this.urlService.URLS.SELL_LOOKUPS);
  }

  @CastResponse(() => LookupsMap, {
    shape: {
      'districtList.*': () => Lookup,
      'propertyTypeList.*': () => Lookup,
      'rentPurposeList.*': () => Lookup,
      'zoneList.*': () => Lookup,
      'municipalityList.*': () => Lookup,
      'nationalityList.*': () => Lookup,
    },
  })
  _loadMortLookups(): Observable<LookupsMap> {
    return this.http.get<LookupsMap>(this.urlService.URLS.MORT_LOOKUPS);
  }

  private _load(): Observable<LookupsMap[]> {
    return forkJoin([this._loadRentLookups(), this._loadSellLookups(), this._loadMortLookups()]).pipe(tap(console.log));
  }

  load(): Observable<LookupsMap[]> {
    return this._load()
      .pipe(
        map(([rent, sell, mort]) => {
          // rent.zoneList = rent.zoneList.filter((i) => i.lookupKey !== -1); // remove the all from zones
          sell.zoneList = sell.zoneList.filter((i) => i.lookupKey !== -1); // remove the all from zones
          mort.zoneList = mort.zoneList.filter((i) => i.lookupKey !== -1); // remove the all from zones
          sell.districtList = sell.districtList.filter((i) => i.lookupKey !== -1 && i.lookupKey !== 0); // remove the all from zones
          rent.districtList = rent.districtList.filter((i) => i.lookupKey !== -1 && i.lookupKey !== 0); // remove the all from zones
          mort.districtList = mort.districtList.filter((i) => i.lookupKey !== -1 && i.lookupKey !== 0); // remove the all from zones
          return [rent, sell, mort];
        }),
        tap(([rent, sell, mort]) => {
          this.rentLookups = this._addAllToMunicipalities(rent);
          this.sellLookups = this._addAllToMunicipalities(this._addAllToDistrict(this._addAllToPropertyType(sell)));
          this.mortLookups = this._addAllToPropertyType(mort);
        })
      )
      .pipe(
        tap((res) => {
          this.rentMunicipalitiesMap = this._initializeMunicipalitiesMap(res[0]);
          this.sellMunicipalitiesMap = this._initializeMunicipalitiesMap(res[1]);
          this.mortMunicipalitiesMap = this._initializeMunicipalitiesMap(res[2]);
        }),
        tap((res) => {
          this.rentZonesMap = this._initializeZonesMap(res[0]);
          this.sellZonesMap = this._initializeZonesMap(res[1]);
          this.mortZonesMap = this._initializeZonesMap(res[2]);
        }),
        tap((res) => {
          this.rentPurposeMap = this._initializePurposeMap(res[0]);
          this.sellPurposeMap = this._initializePurposeMap(res[1]);
          this.mortPurposeMap = this._initializePurposeMap(res[2]);
        }),
        tap((res) => {
          this.rentPropertyTypeMap = this._initializePropertyTypeMap(res[0]);
          this.sellPropertyTypeMap = this._initializePropertyTypeMap(res[1]);
          this.mortPropertyTypeMap = this._initializePropertyTypeMap(res[2]);
        }),
        tap((res) => {
          this.rentDistrictMap = this._initializeDistrictMap(res[0]);
          this.sellDistrictMap = this._initializeDistrictMap(res[1]);
          this.mortDistrictMap = this._initializeDistrictMap(res[2]);
        }),
        tap((res) => {
          this.rentFurnitureMap = this._initializeFurnitureStatusMap(res[0]);
        })
      );
  }

  private _initializeZonesMap(lookups: LookupsMap) {
    return lookups.zoneList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializeMunicipalitiesMap(lookups: LookupsMap) {
    return lookups.municipalityList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializePurposeMap(lookups: LookupsMap) {
    return lookups.rentPurposeList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializePropertyTypeMap(lookups: LookupsMap) {
    return lookups.propertyTypeList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializeDistrictMap(lookups: LookupsMap) {
    return lookups.districtList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializeFurnitureStatusMap(lookups: LookupsMap) {
    return lookups.furnitureStatusList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  // Temporarily used until back team add all from backend
  private _addAllToPropertyType(lookups: LookupsContract) {
    if (lookups.propertyTypeList.find((p) => p.lookupKey === -1)) return lookups;
    lookups.propertyTypeList = [
      new Lookup().clone<Lookup>({
        arName: 'الكل',
        enName: 'All',
        lookupKey: -1,
      }),
      ...lookups.propertyTypeList,
    ];
    return lookups;
  }

  private _addAllToDistrict(lookups: LookupsContract) {
    if (lookups.districtList.find((p) => p.lookupKey === -1)) return lookups;
    lookups.districtList = [
      new Lookup().clone<Lookup>({
        arName: 'الكل',
        enName: 'All',
        lookupKey: -1,
      }),
      ...lookups.districtList,
    ];
    return lookups;
  }

  private _addAllToMunicipalities(lookups: LookupsContract) {
    if (lookups.municipalityList.find((p) => p.lookupKey === -1)) return lookups;
    lookups.municipalityList = [
      new Lookup().clone<Lookup>({
        arName: 'الكل',
        enName: 'All',
        lookupKey: -1,
      }),
      ...lookups.municipalityList,
    ];
    return lookups;
  }
}

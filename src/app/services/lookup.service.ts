import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LookupsContract } from '@contracts/lookups-contract';
import { ServiceContract } from '@contracts/service-contract';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { Lookup } from '@models/lookup';
import { LookupsMap } from '@models/lookups-map';
import { ParamRange } from '@models/param-range';
import { UrlService } from '@services/url.service';
import { CastResponse } from 'cast-response';
import { forkJoin, Observable, tap } from 'rxjs';

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
  ownerLookups!: LookupsContract;
  ovLookups!: LookupsContract;
  brokerLookups!: LookupsContract;

  rentMunicipalitiesMap: Record<number, Lookup> = {};
  sellMunicipalitiesMap: Record<number, Lookup> = {};
  mortMunicipalitiesMap: Record<number, Lookup> = {};
  ownerMunicipalitiesMap: Record<number, Lookup> = {};
  ovMunicipalitiesMap: Record<number, Lookup> = {};
  brokerMunicipalitiesMap: Record<number, Lookup> = {};

  rentZonesMap: Record<number, Lookup> = {};
  sellZonesMap: Record<number, Lookup> = {};
  mortZonesMap: Record<number, Lookup> = {};
  ownerZonesMap: Record<number, Lookup> = {};
  ovZonesMap: Record<number, Lookup> = {};

  rentRoomsMap: Record<number, Lookup> = {};

  rentFurnitureMap: Record<number, Lookup> = {};

  rentPurposeMap: Record<number, Lookup> = {};
  sellPurposeMap: Record<number, Lookup> = {};
  mortPurposeMap: Record<number, Lookup> = {};
  ownerPurposeMap: Record<number, Lookup> = {};

  rentPropertyTypeMap: Record<number, Lookup> = {};
  sellPropertyTypeMap: Record<number, Lookup> = {};
  mortPropertyTypeMap: Record<number, Lookup> = {};
  ownerPropertyTypeMap: Record<number, Lookup> = {};

  sellDistrictMap: Record<number, Lookup> = {};
  rentDistrictMap: Record<number, Lookup> = {};
  mortDistrictMap: Record<number, Lookup> = {};
  ownerDistrictMap: Record<number, Lookup> = {};
  ovDistrictMap: Record<number, Lookup> = {};

  ownerNationalityMap: Record<number, Lookup> = {};

  ownerOwnerCategoryMap: Record<number, Lookup> = {};

  ownerAgeCategoryMap: Record<number, Lookup> = {};

  ownerGenderMap: Record<number, Lookup> = {};

  ovOccupancyStatusMap: Record<number, Lookup> = {};

  ovPremiseCategoryMap: Record<number, Lookup> = {};

  ovPremiseTypeMap: Record<number, Lookup> = {};

  brokerCategoryMap: Record<number, Lookup> = {};

  brokerTypeMap: Record<number, Lookup> = {};

  @CastResponse(() => LookupsMap, {
    shape: {
      'districtList.*': () => Lookup,
      'propertyTypeList.*': () => Lookup,
      'rentPurposeList.*': () => Lookup,
      'zoneList.*': () => Lookup,
      'municipalityList.*': () => Lookup,
      'furnitureStatusList.*': () => Lookup,
      'nationalityList.*': () => Lookup,
      'maxParams.*': () => ParamRange,
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
      'maxParams.*': () => ParamRange,
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
      'maxParams.*': () => ParamRange,
    },
  })
  _loadMortLookups(): Observable<LookupsMap> {
    return this.http.get<LookupsMap>(this.urlService.URLS.MORT_LOOKUPS);
  }

  @CastResponse(() => LookupsMap, {
    shape: {
      'districtList.*': () => Lookup,
      'propertyTypeList.*': () => Lookup,
      'rentPurposeList.*': () => Lookup,
      'zoneList.*': () => Lookup,
      'municipalityList.*': () => Lookup,
      'furnitureStatusList.*': () => Lookup,
      'nationalityList.*': () => Lookup,
      'ownerCategoryList.*': () => Lookup,
      'ageCategoryList.*': () => Lookup,
      'genderList.*': () => Lookup,
      'maxParams.*': () => ParamRange,
    },
  })
  _loadOwnerLookups(): Observable<LookupsMap> {
    return this.http.get<LookupsMap>(this.urlService.URLS.OWNER_LOOKUPS);
  }

  @CastResponse(() => LookupsMap, {
    shape: {
      'districtList.*': () => Lookup,
      'zoneList.*': () => Lookup,
      'municipalityList.*': () => Lookup,
      'occupancyStatusList.*': () => Lookup,
      'premiseCategoryList.*': () => Lookup,
      'premiseTypeList.*': () => Lookup,
    },
  })
  _loadOVLookups(): Observable<LookupsMap> {
    return this.http.get<LookupsMap>(this.urlService.URLS.OV_LOOKUPS);
  }

  @CastResponse(() => LookupsMap, {
    shape: {
      'municipalityList.*': () => Lookup,
      'brokerCategoryList.*': () => Lookup,
      'brokerTypeList.*': () => Lookup,
    },
  })
  _loadBrokerLookups(): Observable<LookupsMap> {
    return this.http.get<LookupsMap>(this.urlService.URLS.BROKER_LOOKUPS);
  }

  private _load(): Observable<LookupsMap[]> {
    return forkJoin([
      this._loadRentLookups(),
      this._loadSellLookups(),
      this._loadMortLookups(),
      this._loadOwnerLookups(),
      this._loadOVLookups(),
      this._loadBrokerLookups(),
    ]);
  }

  load(): Observable<LookupsMap[]> {
    return this._load()
      .pipe(
        tap(([rent, sell, mort]) => {
          // rent.zoneList = rent.zoneList.filter((i) => i.lookupKey !== -1); // remove the all from zones
          sell.zoneList = sell.zoneList.filter((i) => i.lookupKey !== -1); // remove the all from zones
          mort.zoneList = mort.zoneList.filter((i) => i.lookupKey !== -1); // remove the all from zones
          sell.districtList = sell.districtList.filter((i) => i.lookupKey !== -1 && i.lookupKey !== 0); // remove the all from zones
          rent.districtList = rent.districtList.filter((i) => i.lookupKey !== -1 && i.lookupKey !== 0); // remove the all from zones
          mort.districtList = mort.districtList.filter((i) => i.lookupKey !== -1 && i.lookupKey !== 0); // remove the all from zones
        }),
        tap(([rent, sell, mort, owner, ov, broker]) => {
          this.rentLookups = this._addAllToMunicipalities(rent);
          this.sellLookups = this._addAllToMunicipalities(this._addAllToDistrict(this._addAllToPropertyType(sell)));
          this.mortLookups = this._addAllToMunicipalities(this._addAllToDistrict(this._addAllToPropertyType(mort)));
          this.ownerLookups = this._addAllToOwnerCategories(
            this._addStatePropertyToOwnerCategories(
              this._addAllToNationalities(
                this._addAllToDistrict(this._addAllToMunicipalities(this._addAllToPropertyType(owner)))
              )
            )
          );
          this.ovLookups = this._addAllToMunicipalities(
            this._addAllToPremiseCategories(this._addAllToPremiseTypes(ov))
          );
          // remove unknown district from owner lookups until it removed from be
          this.ownerLookups.districtList = this.ownerLookups.districtList.filter((item) => item.lookupKey !== 0);
          this.brokerLookups = broker;
        })
      )
      .pipe(
        tap((res) => {
          this.rentMunicipalitiesMap = this._initializeMunicipalitiesMap(res[0]);
          this.sellMunicipalitiesMap = this._initializeMunicipalitiesMap(res[1]);
          this.mortMunicipalitiesMap = this._initializeMunicipalitiesMap(res[2]);
          this.ownerMunicipalitiesMap = this._initializeMunicipalitiesMap(res[3]);
          this.ovMunicipalitiesMap = this._initializeMunicipalitiesMap(res[4]);
          this.brokerMunicipalitiesMap = this._initializeMunicipalitiesMap(res[5]);
        }),
        tap((res) => {
          this.rentZonesMap = this._initializeZonesMap(res[0]);
          this.sellZonesMap = this._initializeZonesMap(res[1]);
          this.mortZonesMap = this._initializeZonesMap(res[2]);
          this.ownerZonesMap = this._initializeZonesMap(res[3]);
          this.ovZonesMap = this._initializeZonesMap(res[4]);
        }),
        tap((res) => {
          this.rentPurposeMap = this._initializePurposeMap(res[0]);
          this.sellPurposeMap = this._initializePurposeMap(res[1]);
          this.mortPurposeMap = this._initializePurposeMap(res[2]);
          this.ownerPurposeMap = this._initializePurposeMap(res[3]);
        }),
        tap((res) => {
          this.rentPropertyTypeMap = this._initializePropertyTypeMap(res[0]);
          this.sellPropertyTypeMap = this._initializePropertyTypeMap(res[1]);
          this.mortPropertyTypeMap = this._initializePropertyTypeMap(res[2]);
          this.ownerPropertyTypeMap = this._initializePropertyTypeMap(res[3]);
        }),
        tap((res) => {
          this.rentDistrictMap = this._initializeDistrictMap(res[0]);
          this.sellDistrictMap = this._initializeDistrictMap(res[1]);
          this.mortDistrictMap = this._initializeDistrictMap(res[2]);
          this.ownerDistrictMap = this._initializeDistrictMap(res[3]);
          this.ovDistrictMap = this._initializeDistrictMap(res[4]);
        }),
        tap((res) => {
          this.rentFurnitureMap = this._initializeFurnitureStatusMap(res[0]);
        }),

        tap((res) => {
          this.ownerNationalityMap = this._initializeNationalityMap(res[3]);
          this.ownerOwnerCategoryMap = this._initializeOwnerCategoryMap(res[3]);
          this.ownerAgeCategoryMap = this._initializeAgeCategoryMap(res[3]);
          this.ownerGenderMap = this._initializeGenderMap(res[3]);
        }),
        tap((res) => {
          this.ovOccupancyStatusMap = this._initializeOccupancyStatusMap(res[4]);
          this.ovPremiseCategoryMap = this._initializePremiseCategoryMap(res[4]);
          this.ovPremiseTypeMap = this._initializePremiseTypeMap(res[4]);
        }),
        tap((res) => {
          this.brokerCategoryMap = this._initializeBrokerCategoryMap(res[5]);
          this.brokerTypeMap = this._initializeBrokerTypeMap(res[5]);
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

  private _initializeNationalityMap(lookups: LookupsMap) {
    return lookups.nationalityList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializeOwnerCategoryMap(lookups: LookupsMap) {
    return lookups.ownerCategoryList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializeAgeCategoryMap(lookups: LookupsMap) {
    return lookups.ageCategoryList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializeGenderMap(lookups: LookupsMap) {
    return lookups.genderList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }
  private _initializeOccupancyStatusMap(lookups: LookupsMap) {
    return lookups.occupancyStatusList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }
  private _initializePremiseCategoryMap(lookups: LookupsMap) {
    return lookups.premiseCategoryList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }
  private _initializePremiseTypeMap(lookups: LookupsMap) {
    return lookups.premiseTypeList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializeBrokerCategoryMap(lookups: LookupsMap) {
    return lookups.brokerCategoryList.reduce((acc, i) => {
      return { ...acc, [i.lookupKey]: i };
    }, {});
  }

  private _initializeBrokerTypeMap(lookups: LookupsMap) {
    return lookups.brokerTypeList.reduce((acc, i) => {
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

  private _addAllToNationalities(lookups: LookupsContract) {
    if (lookups.nationalityList.find((p) => p.lookupKey === -1)) return lookups;
    lookups.nationalityList = [
      new Lookup().clone<Lookup>({
        arName: 'الكل',
        enName: 'All',
        lookupKey: -1,
      }),
      ...lookups.nationalityList,
    ];
    return lookups;
  }

  private _addAllToOwnerCategories(lookups: LookupsContract) {
    if (lookups.ownerCategoryList.find((p) => p.lookupKey === -1)) return lookups;
    lookups.ownerCategoryList = [
      new Lookup().clone<Lookup>({
        arName: 'الكل',
        enName: 'All',
        lookupKey: -1,
      }),
      ...lookups.ownerCategoryList,
    ];
    return lookups;
  }

  private _addStatePropertyToOwnerCategories(lookups: LookupsContract) {
    if (lookups.ownerCategoryList.find((p) => p.lookupKey === 82804)) return lookups;
    lookups.ownerCategoryList = [
      new Lookup().clone<Lookup>({
        arName: 'أملاك دولة',
        enName: 'State property',
        lookupKey: 82804,
      }),
      ...lookups.ownerCategoryList,
    ];
    return lookups;
  }

  private _addAllToPremiseCategories(lookups: LookupsContract) {
    if (lookups.premiseCategoryList.find((p) => p.lookupKey === -1)) return lookups;
    lookups.premiseCategoryList = [
      ...lookups.premiseCategoryList,
      new Lookup().clone<Lookup>({
        arName: 'الكل',
        enName: 'All',
        lookupKey: -1,
      }),
    ];
    return lookups;
  }

  private _addAllToPremiseTypes(lookups: LookupsContract) {
    if (lookups.premiseTypeList.find((p) => p.lookupKey === -1)) return lookups;
    lookups.premiseTypeList = [
      new Lookup().clone<Lookup>({
        arName: 'الكل',
        enName: 'All',
        lookupKey: -1,
      }),
      ...lookups.premiseTypeList,
    ];
    return lookups;
  }
}

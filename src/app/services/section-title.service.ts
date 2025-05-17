import { Injectable, inject } from '@angular/core';
import { LookupService } from './lookup.service';
import { CriteriaContract } from '@contracts/criteria-contract';
import { Lookup } from '@models/lookup';
import { DateAdapter } from '@angular/material/core';
import { TranslationService } from './translation.service';
import { L } from '@directus/sdk/dist/index-e2e3c31a';
@Injectable({
  providedIn: 'root',
})
export class SectionTitleService {
  lookupService = inject(LookupService);
  lang = inject(TranslationService);
  adapter = inject(DateAdapter);

  months: { label: string; value: number }[] = [];
  quarterYearDurations = this.lookupService.rentLookups.quarterYearDurations;

  constructor() {
    this._setMonths();
    this._listenToLangChange();
  }

  getSelectedCriteria(
    indicatorPrefix: string,
    criteria: CriteriaContract,
    isZoneRequired = true,
    isDistrictRequired = true,
    isYearRequired = true,
    isMunicipalityRequired = true,
    isNationalityRequired = false,
    showMonthOrQuarter = false,
    showServiceType = false
  ): string {
    const generatedTitle: string[] = [];

    if (isMunicipalityRequired) {
      const municipality = this.getSelectedMunicipality(indicatorPrefix, criteria);
      municipality.length && generatedTitle.push(municipality);
    }

    if (isDistrictRequired) {
      const district = this.getSelectedDistrict(indicatorPrefix, criteria);
      district.length && generatedTitle.push(district);
    }

    if (isZoneRequired) {
      const zone = this.getSelectedZone(indicatorPrefix, criteria);
      zone.length && generatedTitle.push(zone);
    }

    if (indicatorPrefix === 'rent' && showServiceType && criteria['serviceType' as keyof CriteriaContract] !== -1) {
      const serviceType = this.getSelectedServiceType(criteria['serviceType' as keyof CriteriaContract] as number);
      serviceType && generatedTitle.push(serviceType);
    }

    const propertyType =
      indicatorPrefix === 'ov'
        ? this.getSelectedPremiseType(indicatorPrefix, criteria as any)
        : this.getSelectedPropertyType(indicatorPrefix, criteria);
    const purpose =
      indicatorPrefix === 'ov'
        ? this.getSelectedPremiseCategory(indicatorPrefix, criteria as any)
        : this.getSelectedPurpose(indicatorPrefix, criteria);

    propertyType.length && generatedTitle.push(propertyType);
    purpose.length && generatedTitle.push(purpose);

    if (isNationalityRequired) {
      const nationality = this.getSelectedNationality(indicatorPrefix, criteria);
      nationality.length && generatedTitle.push(nationality);
    }

    if (isYearRequired) {
      let _duration = this.getSelectedYear(criteria);
      if (showMonthOrQuarter) {
        if (criteria.issueDateStartMonth === criteria.issueDateEndMonth) {
          _duration += ' (' + this.months[criteria.issueDateStartMonth - 1].label + ')';
        }
        if (criteria.issueDateQuarterList.length < 4 && criteria.issueDateQuarterList.length >= 1) {
          if (criteria.issueDateQuarterList.length === 1) {
            _duration += ' (' + this.quarterYearDurations[criteria.issueDateQuarterList[0] - 1].getNames() + ')';
          } else {
            _duration += ' (';
            criteria.issueDateQuarterList.forEach((q, i) => {
              if (i === criteria.issueDateQuarterList.length - 1)
                _duration += this.quarterYearDurations[q - 1].getNames() + ')';
              else _duration += this.quarterYearDurations[q - 1].getNames() + '+';
            });
          }
        }
      }
      generatedTitle.push(_duration);
    }
    return generatedTitle.length ? `(${generatedTitle.join(' , ')})` : '';
  }
  propertyOf<TObj>(name: keyof TObj) {
    return name;
  }

  private getSelectedMunicipality(prefix: string, criteria: CriteriaContract): string {
    if (criteria.municipalityId === -1) return '';
    const lookupMap = this.lookupService[(prefix + 'MunicipalitiesMap') as keyof LookupService] as Record<
      number,
      Lookup
    >;
    return lookupMap[criteria.municipalityId]?.getNames() || '';
  }

  private getSelectedDistrict(prefix: string, criteria: CriteriaContract): string {
    const areaCode = criteria.areaCode;
    if (areaCode === -1) return '';
    const lookupMap = this.lookupService[(prefix + 'DistrictMap') as keyof LookupService] as Record<number, Lookup>;
    return lookupMap[areaCode!]?.getNames() || '';
  }

  private getSelectedPropertyType(prefix: string, criteria: CriteriaContract): string {
    const lookupMap = this.lookupService[(prefix + 'PropertyTypeMap') as keyof LookupService] as Record<number, Lookup>;
    return this._mapMultiple(lookupMap, criteria.propertyTypeList);
  }

  private getSelectedServiceType(serviceTypeId: number) {
    return this.lookupService.rentServiceTypeMap[serviceTypeId]?.getNames();
  }

  private getSelectedYear(criteria: CriteriaContract): string {
    return criteria.issueDateYear!.toString();
  }
  private getSelectedPurpose(prefix: string, criteria: CriteriaContract): string {
    const lookupMap = this.lookupService[(prefix + 'PurposeMap') as keyof LookupService] as Record<number, Lookup>;
    return this._mapMultiple(lookupMap, criteria.purposeList);
  }

  private getSelectedZone(prefix: string, criteria: CriteriaContract): string {
    if (criteria.zoneId === -1) return '';
    const lookupMap = this.lookupService[(prefix + 'ZonesMap') as keyof LookupService] as Record<number, Lookup>;

    return lookupMap[criteria.zoneId!]?.getNames() || '';
  }

  private getSelectedNationality(prefix: string, criteria: CriteriaContract): string {
    if (criteria.nationalityCode === -1) return '';
    const lookupMap = this.lookupService[(prefix + 'NationalityMap') as keyof LookupService] as Record<number, Lookup>;

    return lookupMap[criteria.nationalityCode!]?.getNames() || '';
  }

  private getSelectedPremiseCategory(
    prefix: string,
    criteria: CriteriaContract & { premiseCategoryList: number[] }
  ): string {
    const lookupMap = this.lookupService[(prefix + 'PremiseCategoryMap') as keyof LookupService] as Record<
      number,
      Lookup
    >;
    return this._mapMultiple(lookupMap, criteria.premiseCategoryList);
  }

  private getSelectedPremiseType(prefix: string, criteria: CriteriaContract & { premiseTypeList: number[] }): string {
    const lookupMap = this.lookupService[(prefix + 'PremiseTypeMap') as keyof LookupService] as Record<number, Lookup>;
    return this._mapMultiple(lookupMap, criteria.premiseTypeList);
  }

  private _listenToLangChange() {
    this.lang.change$.subscribe(() => this._setMonths());
  }

  private _setMonths() {
    this.adapter.setLocale(this.lang.getCurrent().code === 'ar-SA' ? 'ar-EG' : 'en-US');
    const _months = this.adapter.getMonthNames('long');
    this.months = _months.map((month, index) => ({
      label: month,
      value: index + 1,
    }));
  }

  private _mapMultiple(lookupMap: Record<number, Lookup>, list: number[]) {
    return list && list[0] !== -1
      ? list.length === 1
        ? lookupMap[list[0]]?.getNames()
        : `[${list
            .map((l) => lookupMap[l]?.getNames())
            .filter((l) => l)
            .join(' - ')}]`
      : '';
  }
}

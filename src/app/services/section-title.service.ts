import { Injectable, inject } from '@angular/core';
import { LookupService } from './lookup.service';
import { CriteriaContract } from '@contracts/criteria-contract';
import { Lookup } from '@models/lookup';
@Injectable({
  providedIn: 'root',
})
export class SectionTitleService {
  lookupService = inject(LookupService);

  getSelectedCriteria(
    indicatorPrefix: string,
    criteria: CriteriaContract,
    isZoneRequired = true,
    isDistrictRequired = true,
    isYearRequired = true,
    isMunicipalityRequired = true,
    isNationalityRequired = false
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
      const year = this.getSelectedYear(criteria);
      generatedTitle.push(year);
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
    return criteria.propertyTypeList && criteria.propertyTypeList[0] !== -1
      ? lookupMap[criteria.propertyTypeList[0]]?.getNames()
      : '';
  }
  private getSelectedYear(criteria: CriteriaContract): string {
    return criteria.issueDateYear!.toString();
  }
  private getSelectedPurpose(prefix: string, criteria: CriteriaContract): string {
    const lookupMap = this.lookupService[(prefix + 'PurposeMap') as keyof LookupService] as Record<number, Lookup>;
    return criteria.purposeList && criteria.purposeList[0] !== -1 ? lookupMap[criteria.purposeList[0]]?.getNames() : '';
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
    return criteria.premiseCategoryList && criteria.premiseCategoryList[0] !== -1
      ? lookupMap[criteria.premiseCategoryList[0]]?.getNames()
      : '';
  }

  private getSelectedPremiseType(prefix: string, criteria: CriteriaContract & { premiseTypeList: number[] }): string {
    const lookupMap = this.lookupService[(prefix + 'PremiseTypeMap') as keyof LookupService] as Record<number, Lookup>;
    return criteria.premiseTypeList && criteria.premiseTypeList[0] !== -1
      ? lookupMap[criteria.premiseTypeList[0]]?.getNames()
      : '';
  }
}

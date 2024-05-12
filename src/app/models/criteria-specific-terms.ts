import { CriteriaContract } from '@contracts/criteria-contract';
import { LangKeysContract } from '@contracts/lang-keys-contract';
import { ServiceRegistry } from '@services/service-registry';
import { TranslationService } from '@services/translation.service';
import { isArray } from '@utils/utils';

export enum CriteriaTerms {
  SINGLE,
  SINGLE_NOT_ALL,
  NOT_ALL,
  EQUAL_TO_ALL,
}

export type CriteriaTerm =
  | keyof CriteriaContract
  | { criteriaKey: keyof CriteriaContract; term: CriteriaTerms; mapTo?: string };

export class CriteriaSpecificTerms {
  private _terms: CriteriaTerm[];
  private _langService: TranslationService;

  hasTerms: boolean;

  constructor(terms: CriteriaTerm[]) {
    this.hasTerms = !!terms.length;
    this._terms = terms;
    this._langService = ServiceRegistry.get<TranslationService>('TranslationService');
  }

  validate(criteria: CriteriaContract) {
    if (!criteria) return true;
    let _valid = true;
    this._terms.forEach((term) => {
      if (typeof term === 'string') {
        if (!isNotAll(criteria[term] as number | number[])) _valid = false;
      } else {
        if (term.term === CriteriaTerms.NOT_ALL) {
          if (!isNotAll(criteria[term.criteriaKey] as number | number[])) _valid = false;
        }
        if (term.term === CriteriaTerms.EQUAL_TO_ALL) {
          if (!isEqualToAll(criteria[term.criteriaKey] as number | number[])) _valid = false;
        }
        if (term.term === CriteriaTerms.SINGLE) {
          if (!isSingle(criteria[term.criteriaKey] as Array<number>)) _valid = false;
        }
        if (term.term === CriteriaTerms.SINGLE_NOT_ALL) {
          if (!isSingleAndNotAll(criteria[term.criteriaKey] as Array<number>)) _valid = false;
        }
      }
    });
    return _valid;
  }

  getCriteriaTermsText() {
    const _terms: string[] = [];
    this._terms.forEach((term) => {
      let _itemLabel = '';
      let _termText = '';
      if (typeof term === 'string') {
        _itemLabel = this._langService.getTranslate(CriteriaToLangKey[term]);
        _termText = this._langService.getTranslate(TermToLangKey[CriteriaTerms.NOT_ALL]);
      } else {
        _itemLabel = this._langService.getTranslate(CriteriaToLangKey[term.criteriaKey]);
        _termText = this._langService.getTranslate(TermToLangKey[term.term]);
      }
      _terms.push(_itemLabel + ': ' + _termText);
    });
    return _terms;
  }

  getMappedCriteria(criteria: CriteriaContract) {
    if (!criteria) return {};
    if (!this.hasTerms) return criteria;
    const _criteria: any = {};
    this._terms.forEach((term) => {
      if (typeof term === 'string') {
        _criteria[term] = criteria[term];
      } else {
        if (isArray(criteria[term.criteriaKey])) {
          if (term.term === CriteriaTerms.SINGLE || term.term === CriteriaTerms.SINGLE_NOT_ALL) {
            _criteria[term.mapTo ?? term.criteriaKey] = (criteria[term.criteriaKey] as Array<number>)[0];
          } else {
            _criteria[term.mapTo ?? term.criteriaKey] = criteria[term.criteriaKey];
          }
        } else {
          _criteria[term.mapTo ?? term.criteriaKey] = criteria[term.criteriaKey];
        }
      }
    });
    return _criteria;
  }
}

function isNotAll(value: number | number[]) {
  if (isArray(value)) return !value.includes(-1);
  return value !== -1;
}

function isEqualToAll(value: number | number[]) {
  if (isArray(value)) return value.includes(-1);
  return value === -1;
}

function isSingle(value: Array<number>) {
  return isArray(value) && value.length === 1;
}

function isSingleAndNotAll(value: Array<number>) {
  return isArray(value) && value.length === 1 && !value.includes(-1);
}

const TermToLangKey: Record<CriteriaTerms, keyof LangKeysContract> = {
  [CriteriaTerms.NOT_ALL]: 'value_other_than_all',
  [CriteriaTerms.EQUAL_TO_ALL]: 'value_equal_to_all',
  [CriteriaTerms.SINGLE]: 'single_value',
  [CriteriaTerms.SINGLE_NOT_ALL]: 'single_value_other_than_all',
};

export const CriteriaToLangKey = {
  municipalityId: 'municipal',
  areaCode: 'district',
  zoneId: 'zone',
  propertyTypeList: 'property_type',
  purposeList: 'property_usage',
  ['occupancyStatus' as keyof CriteriaContract]: 'occupancy_status',
  ['premiseCategoryList' as keyof CriteriaContract]: 'premise_category',
  ['premiseTypeList' as keyof CriteriaContract]: 'premise_type',

  ['ownerCategoryCode' as keyof CriteriaContract]: 'owner_type',
  nationalityCode: 'nationality',

  ['durationType' as keyof CriteriaContract]: 'duration',
  ['issueDateYear' as keyof CriteriaContract]: 'year',
  ['halfYearDuration' as keyof CriteriaContract]: 'half',
  ['issueDateQuarterList' as keyof CriteriaContract]: 'quarter',
  ['issueDateMonth' as keyof CriteriaContract]: 'month',

  ['bedRoomsCount' as keyof CriteriaContract]: 'number_of_rooms',
  ['furnitureStatus' as keyof CriteriaContract]: 'furniture_status',
  streetNo: 'street',
  ['rentPaymentMonthlyPerUnitFrom' as keyof CriteriaContract]: 'rental_value_per_month_from',
  ['rentPaymentMonthlyPerUnitTo' as keyof CriteriaContract]: 'rental_value_per_month_to',
  ['realEstateValueFrom' as keyof CriteriaContract]: 'real_estate_value_from',
  ['realEstateValueTo' as keyof CriteriaContract]: 'real_estate_value_to',
  ['unit' as keyof CriteriaContract]: 'measuring_unit',
  ['areaFrom' as keyof CriteriaContract]: 'area_from',
  ['areaTo' as keyof CriteriaContract]: 'area_to',
  ['brokerCategoryId' as keyof CriteriaContract]: 'broker_category',
  ['brokerName' as keyof CriteriaContract]: 'broker_name',
} as Record<keyof CriteriaContract, keyof LangKeysContract>;

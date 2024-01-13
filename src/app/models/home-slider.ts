import { QuarterYearDurations } from '@enums/quarter-year-durations';
import { ServiceRegistry } from '@services/service-registry';
import { TranslationService } from '@services/translation.service';

export class HomeSlider {
  year!: number;
  kpiVal!: number;
  kpiCount!: number;
  transType!: 'SELL' | 'RENT' | 'MORT';
  quarter!: number;

  private _langService = ServiceRegistry.get<TranslationService>('TranslationService');

  getCountTitle() {
    return (
      (this.transType === 'SELL'
        ? this._langService.map.total_number_of_sell_transactions
        : this.transType === 'RENT'
        ? this._langService.map.total_number_of_rent_transactions
        : this._langService.map.total_number_of_mort_transactions) +
      ' ' +
      this._langService.map.in +
      ' ' +
      this._getQuarterName(this.quarter) +
      ' ' +
      this._langService.map.for_year +
      ' ' +
      this.year
    );
  }

  getValueTitle() {
    return (
      (this.transType === 'SELL'
        ? this._langService.map.total_value_of_sell_transactions
        : this.transType === 'RENT'
        ? this._langService.map.total_value_of_rent_transactions
        : this._langService.map.total_value_of_mort_transactions) +
      ' ' +
      this._langService.map.in +
      ' ' +
      this._getQuarterName(this.quarter) +
      ' ' +
      this._langService.map.for_year +
      ' ' +
      this.year
    );
  }

  private _getQuarterName(quarter: QuarterYearDurations) {
    return quarter === QuarterYearDurations.FIRST_QUARTER
      ? this._langService.map.first_quarter
      : quarter === QuarterYearDurations.SECOND_QUARTER
      ? this._langService.map.second_quarter
      : quarter === QuarterYearDurations.THIRD_QUARTER
      ? this._langService.map.third_quarter
      : this._langService.map.last_quarter;
  }
}

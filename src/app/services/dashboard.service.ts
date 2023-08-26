import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CriteriaContract } from '@contracts/criteria-contract';
import { DurationDataContract } from '@contracts/duration-data-contract';
import { MortgageCriteriaContract } from '@contracts/mortgage-criteria-contract';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { SellCriteriaContract } from '@contracts/sell-criteria-contract';
import { ServiceContract } from '@contracts/service-contract';
import { DurationEndpoints } from '@enums/durations';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import {
  CompositeTransaction,
  RentCompositeTransaction,
  SellCompositeTransaction,
} from '@models/composite-transaction';
import { KpiBaseModel } from '@models/kpi-base-model';
import { KpiDurationModel } from '@models/kpi-duration-model';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { Lookup } from '@models/lookup';
import { RentDefaultValues } from '@models/rent-default-values';
import { RentTop10Model } from '@models/rent-top-10-model';
import { RentTransaction } from '@models/rent-transaction';
import { RentTransactionPurpose } from '@models/rent-transaction-purpose';
import { RoomNumberKpi } from '@models/room-number-kpi';
import { SellDefaultValues } from '@models/sell-default-values';
import { SellTop10Model } from '@models/sell-top-10-model';
import { SellTransaction } from '@models/sell-transaction';
import { SellTransactionPurpose } from '@models/sell-transaction-purpose';
import { UrlService } from '@services/url.service';
import { chunks, minMaxAvg, range } from '@utils/utils';
import { CastResponse } from 'cast-response';
import { forkJoin, map, Observable } from 'rxjs';
import { RentTransactionPurposePopupComponent } from '../popups/rent-transaction-purpose-popup/rent-transaction-purpose-popup.component';
import { SellTransactionPurposePopupComponent } from '../popups/sell-transaction-purpose-popup/sell-transaction-purpose-popup.component';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends RegisterServiceMixin(class {}) implements ServiceContract {
  serviceName = 'DashboardService';
  private http = inject(HttpClient);
  private urlService = inject(UrlService);
  private dialog = inject(DialogService);

  @CastResponse(() => RentDefaultValues)
  loadRentDefaults(criteria: Partial<RentCriteriaContract>): Observable<RentDefaultValues[]> {
    return this.http.post<RentDefaultValues[]>(this.urlService.URLS.DEFAULT_RENT, criteria);
  }

  @CastResponse(() => SellDefaultValues)
  loadSellDefaults(criteria: Partial<SellCriteriaContract>): Observable<SellDefaultValues[]> {
    return this.http.post<SellDefaultValues[]>(this.urlService.URLS.DEFAULT_SELL, criteria);
  }

  loadMortgageRoots(criteria: Partial<MortgageCriteriaContract>): Observable<KpiModel[]> {
    return forkJoin([
      this.http.post<KpiModel[]>(this.urlService.URLS.MORT_KPI1, criteria),
      this.http.post<KpiModel[]>(this.urlService.URLS.MORT_KPI3, criteria),
      this.http.post<KpiModel[]>(this.urlService.URLS.MORT_KPI5, criteria),
    ]).pipe(
      map(([first, second, third]) => {
        return [first[0], second[0], third[0]];
      })
    );
  }

  loadKpiRoot(kpi: KpiRoot, criteria: CriteriaContract): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.url, criteria);
  }

  loadPurposeKpi(kpi: KpiRoot, criteria: Partial<CriteriaContract>): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.subUrl!, criteria);
  }

  loadPropertyTypeKpi(kpi: KpiRoot, criteria: Partial<CriteriaContract>): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.secondSubUrl!, criteria);
  }

  loadLineChartKpi(kpi: KpiRoot, criteria: Partial<CriteriaContract>): Observable<KpiModel[]> {
    // forkJoin([
    //   this.loadLineChartKpiForDuration(DurationEndpoints.HALFY, kpi, criteria),
    //   this.loadLineChartKpiForDuration(DurationEndpoints.RENT_QUARTERLY, kpi, criteria),
    //   this.loadLineChartKpiForDuration(DurationEndpoints.MONTHLY, kpi, criteria),
    // ]).subscribe(console.log);
    return this.http.post<KpiModel[]>(kpi.lineChart!, criteria);
  }

  loadLineChartKpiForDuration(
    endPoint: DurationEndpoints,
    kpi: KpiRoot,
    criteria: Partial<CriteriaContract>
  ): Observable<KpiDurationModel[]> {
    return this.http.post<KpiDurationModel[]>(kpi.lineChart! + '/' + endPoint, criteria);
  }

  @CastResponse(() => RentTransactionPurpose)
  loadRentTransactionsBasedOnPurpose(criteria: Partial<RentCriteriaContract>): Observable<RentTransactionPurpose[]> {
    return this.http.post<RentTransactionPurpose[]>(this.urlService.URLS.RENT_KPI25, criteria);
  }

  @CastResponse(() => SellTransactionPurpose)
  loadSellTransactionsBasedOnPurpose(criteria: Partial<SellCriteriaContract>): Observable<SellTransactionPurpose[]> {
    return this.http.post<SellTransactionPurpose[]>(this.urlService.URLS.SELL_KPI25, criteria);
  }

  @CastResponse(() => RentTransactionPurpose)
  loadRentTransactionsBasedOnPurposeDetails(
    criteria: Partial<RentCriteriaContract>
  ): Observable<RentTransactionPurpose[]> {
    return this.http.post<RentTransactionPurpose[]>(this.urlService.URLS.RENT_KPI26, criteria);
  }

  @CastResponse(() => SellTransactionPurpose)
  loadSellTransactionsBasedOnPurposeDetails(
    criteria: Partial<SellCriteriaContract>
  ): Observable<SellTransactionPurpose[]> {
    return this.http.post<SellTransactionPurpose[]>(this.urlService.URLS.SELL_KPI26, criteria);
  }

  @CastResponse(() => RentTransaction)
  loadRentKpiTransactions(criteria: Partial<CriteriaContract>): Observable<RentTransaction[]> {
    return this.http.post<RentTransaction[]>(this.urlService.URLS.RENT_KPI29, criteria);
  }

  @CastResponse(() => SellTransaction)
  loadSellKpiTransactions(criteria: Partial<CriteriaContract>): Observable<SellTransaction[]> {
    return this.http.post<SellTransaction[]>(this.urlService.URLS.SELL_KPI29, criteria);
  }

  @CastResponse(() => RentTop10Model)
  loadRentTop10BasedOnCriteria(item: Lookup, criteria: Partial<RentCriteriaContract>): Observable<RentTop10Model[]> {
    return this.http.post<RentTop10Model[]>(item.url, criteria);
  }

  @CastResponse(() => SellTop10Model)
  loadSellTop10BasedOnCriteria(item: Lookup, criteria: Partial<RentCriteriaContract>): Observable<SellTop10Model[]> {
    return this.http.post<SellTop10Model[]>(item.url, criteria);
  }

  @CastResponse(() => CompositeTransaction)
  private _loadCompositeTransactions(
    url: string,
    criteria: Partial<CriteriaContract>
  ): Observable<CompositeTransaction[]> {
    return this.http.post<CompositeTransaction[]>(url, criteria);
  }

  @CastResponse(() => SellCompositeTransaction)
  _loadSellCompositeTransactions(criteria: Partial<SellCriteriaContract>) {
    return this.http.post<SellCompositeTransaction[]>(this.urlService.URLS.SELL_KPI35_36_37, criteria);
  }

  @CastResponse(() => RentCompositeTransaction)
  _loadRentCompositeTransactions(criteria: Partial<RentCriteriaContract>) {
    return this.http.post<RentCompositeTransaction[]>(this.urlService.URLS.RENT_KPI35_36_37, criteria);
  }

  loadSellCompositeTransactions(criteria: Partial<SellCriteriaContract>) {
    return this.mapCompositeTransactions(this._loadSellCompositeTransactions(criteria));
  }

  loadRentCompositeTransactions(criteria: Partial<RentCriteriaContract>) {
    return this.mapCompositeTransactions(this._loadRentCompositeTransactions(criteria));
  }

  private mapCompositeTransactions(compositeTransactions: Observable<CompositeTransaction[]>): Observable<{
    years: { selectedYear: number; previousYear: number };
    items: CompositeTransaction[][];
  }> {
    return compositeTransactions
      .pipe(
        map((values) => {
          return values;
        }),
        map((values) => {
          return [...chunks(values, 2)];
        })
      )
      .pipe(
        map((values) => {
          return {
            years: {
              previousYear: values[0][0].issueYear,
              selectedYear: values[0][1].issueYear,
            },
            items: values,
          };
        })
      );
  }

  @CastResponse(() => RoomNumberKpi)
  loadRentRoomCounts(criteria: Partial<RentCriteriaContract>): Observable<RoomNumberKpi[]> {
    return this.http.post<RoomNumberKpi[]>(this.urlService.URLS.RENT_KPI34, criteria);
  }

  @CastResponse(() => RoomNumberKpi)
  loadSellRoomCounts(criteria: Partial<SellCriteriaContract>): Observable<RoomNumberKpi[]> {
    return this.http.post<RoomNumberKpi[]>(this.urlService.URLS.SELL_KPI34, criteria);
  }

  openRentChartDialogBasedOnPurpose(
    criteria: Partial<RentCriteriaContract>
  ): Observable<MatDialogRef<RentTransactionPurposePopupComponent>> {
    return this.loadRentTransactionsBasedOnPurposeDetails(criteria).pipe(
      map((data) =>
        this.dialog.open<RentTransactionPurposePopupComponent, RentTransactionPurpose[]>(
          RentTransactionPurposePopupComponent,
          { data }
        )
      )
    );
  }

  openSellChartDialogBasedOnPurpose(
    criteria: Partial<SellCriteriaContract>
  ): Observable<MatDialogRef<SellTransactionPurposePopupComponent>> {
    return this.loadSellTransactionsBasedOnPurposeDetails(criteria).pipe(
      map((data) =>
        this.dialog.open<SellTransactionPurposePopupComponent, SellTransactionPurpose[]>(
          SellTransactionPurposePopupComponent,
          { data }
        )
      )
    );
  }

  loadMortgageTransactionCountChart(
    criteria: Partial<MortgageCriteriaContract>,
    duration: DurationEndpoints = DurationEndpoints.YEARLY
  ): Observable<Record<number, KpiModel[]>> {
    return this.http
      .post<KpiModel[]>(this.getSelectedDurationString(this.urlService.URLS.MORT_KPI2, duration), criteria)
      .pipe(
        map((values) => {
          return values.reduce((acc, item) => {
            if (!Object.prototype.hasOwnProperty.call(acc, item.issueYear)) {
              acc[item.issueYear] = [];
            }
            acc[item.issueYear].push(item);
            return { ...acc };
          }, {} as Record<number, KpiModel[]>);
        })
      );
  }

  loadMortgageTransactionValueChart(
    criteria: Partial<MortgageCriteriaContract>,
    duration: DurationEndpoints = DurationEndpoints.YEARLY
  ): Observable<Record<number, KpiBaseModel[]>> {
    return this.http
      .post<KpiBaseModel[]>(this.getSelectedDurationString(this.urlService.URLS.MORT_KPI6, duration), criteria)
      .pipe(
        map((values) => {
          return values.reduce((acc, item) => {
            if (!Object.prototype.hasOwnProperty.call(acc, item.issueYear)) {
              acc[item.issueYear] = [];
            }
            acc[item.issueYear].push(item);
            return { ...acc };
          }, {} as Record<number, KpiBaseModel[]>);
        })
      );
  }

  private getSelectedDurationString(url: string, duration: DurationEndpoints): string {
    return (
      url +
      (duration === DurationEndpoints.YEARLY
        ? ''
        : duration === DurationEndpoints.HALFY
        ? '/halfly'
        : duration === DurationEndpoints.SELL_QUARTERLY
        ? '/quartley'
        : duration === DurationEndpoints.MONTHLY
        ? '/monthly'
        : '')
    );
  }

  mapDurationData(data: KpiDurationModel[], durations: Lookup[]): DurationDataContract {
    const durationData: DurationDataContract = {};

    const { min: minYear, max: maxYear } = minMaxAvg(data.map((item) => item.issueYear));
    const yearRange = range(minYear, maxYear);

    durations.forEach((item) => {
      durationData[item.lookupKey] = { period: item, kpiValues: [] };
    });

    data.forEach((item) => {
      durationData[item.issuePeriod].kpiValues.push({ year: item.issueYear, value: item.kpiVal });
    });

    yearRange.forEach((year) => {
      durations.forEach((item) => {
        durationData[item.lookupKey].kpiValues.find((d) => d.year === year) ??
          durationData[item.lookupKey].kpiValues.push({ year, value: 0 });
      });
    });

    durations.forEach((item) => {
      durationData[item.lookupKey].kpiValues.sort((a, b) => a.year - b.year);
    });

    return durationData;
  }
}

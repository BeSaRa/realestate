import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CriteriaContract } from '@contracts/criteria-contract';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { SellCriteriaContract } from '@contracts/sell-criteria-contract';
import { ServiceContract } from '@contracts/service-contract';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import {
  CompositeTransaction,
  RentCompositeTransaction,
  SellCompositeTransaction,
} from '@models/composite-transaction';
import { KpiModel } from '@models/kpi-model';
import { KpiRoot } from '@models/kpiRoot';
import { Lookup } from '@models/lookup';
import { RentDefaultValues } from '@models/rent-default-values';
import { RentTop10Model } from '@models/rent-top-10-model';
import { RentTransaction } from '@models/rent-transaction';
import { RoomNumberKpi } from '@models/room-number-kpi';
import { SellDefaultValues } from '@models/sell-default-values';
import { SellTop10Model } from '@models/sell-top-10-model';
import { UrlService } from '@services/url.service';
import { chunks } from '@utils/utils';
import { CastResponse } from 'cast-response';
import { forkJoin, map, Observable } from 'rxjs';
import { DialogService } from './dialog.service';
import { RentTransactionPurpose } from '@models/rent-transaction-purpose';
import { MatDialogRef } from '@angular/material/dialog';
import { RentTransactionPurposePopupComponent } from '../popups/rent-transaction-purpose-popup/rent-transaction-purpose-popup.component';
import { SellTransaction } from '@models/sell-transaction';
import { SellTransactionPurpose } from '@models/sell-transaction-purpose';
import { SellTransactionPurposePopupComponent } from '../popups/sell-transaction-purpose-popup/sell-transaction-purpose-popup.component';
import { MortgageCriteriaContract } from '@contracts/mortgage-criteria-contract';

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
    return this.http.post<KpiModel[]>(kpi.lineChart!, criteria);
  }

  loadLineChartKpi_H(kpi: KpiRoot, criteria: Partial<CriteriaContract>): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.lineChart! + '/halfy', criteria);
  }

  loadLineChartKpi_M(kpi: KpiRoot, criteria: Partial<CriteriaContract>): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.lineChart! + '/monthly', criteria);
  }

  loadLineChartKpi_Q(kpi: KpiRoot, criteria: Partial<CriteriaContract>): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.lineChart! + '/quarterly', criteria);
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
}

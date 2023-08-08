import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CriteriaContract } from '@contracts/criteria-contract';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { SellCriteriaContract } from '@contracts/sell-criteria-contract';
import { ServiceContract } from '@contracts/service-contract';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { CompositeTransaction } from '@models/composite-transaction';
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
import { DialogService } from '@services/dialog.service';
import { UrlService } from '@services/url.service';
import { chunks } from '@utils/utils';
import { CastResponse } from 'cast-response';
import { map, Observable } from 'rxjs';
import { RentTransactionPurposePopupComponent } from '../popups/rent-transaction-purpose-popup/rent-transaction-purpose-popup.component';

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

  @CastResponse(() => RentTransaction)
  loadKpiTransactions(criteria: Partial<CriteriaContract>): Observable<RentTransaction[]> {
    return this.http.post<RentTransaction[]>(this.urlService.URLS.RENT_KPI29, criteria);
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
  private _loadCompositeTransactions(criteria: Partial<RentCriteriaContract>): Observable<CompositeTransaction[]> {
    return this.http.post<CompositeTransaction[]>(this.urlService.URLS.RENT_KPI35_36_37, criteria);
  }

  loadCompositeTransactions(
    criteria: Partial<RentCriteriaContract>
  ): Observable<{ years: { selectedYear: number; previousYear: number }; items: CompositeTransaction[][] }> {
    return this._loadCompositeTransactions(criteria)
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

  @CastResponse(() => RentTransactionPurpose)
  loadTransactionsBasedOnPurpose(criteria: Partial<RentCriteriaContract>): Observable<RentTransactionPurpose[]> {
    return this.http.post<RentTransactionPurpose[]>(this.urlService.URLS.RENT_KPI25, criteria);
  }

  @CastResponse(() => RentTransactionPurpose)
  loadTransactionsBasedOnPurposeDetails(criteria: Partial<RentCriteriaContract>): Observable<RentTransactionPurpose[]> {
    return this.http.post<RentTransactionPurpose[]>(this.urlService.URLS.RENT_KPI26, criteria);
  }

  openRentChartDialogBasedOnPurpose(
    criteria: Partial<RentCriteriaContract>
  ): Observable<MatDialogRef<RentTransactionPurposePopupComponent>> {
    return this.loadTransactionsBasedOnPurposeDetails(criteria).pipe(
      map((data) =>
        this.dialog.open<RentTransactionPurposePopupComponent, RentTransactionPurpose[]>(
          RentTransactionPurposePopupComponent,
          { data }
        )
      )
    );
  }
}

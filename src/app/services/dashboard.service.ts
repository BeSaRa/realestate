import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { UrlService } from '@services/url.service';
import { RentDefaultValues } from '@models/rent-default-values';
import { CastResponse } from 'cast-response';
import { KpiRoot } from '@models/kpiRoot';
import { KpiModel } from '@models/kpi-model';
import { RentTransaction } from '@models/rent-transaction';
import { Lookup } from '@models/lookup';
import { Top10Model } from '@models/top-10-model';
import { CompositeTransaction } from '@models/composite-transaction';
import { chunks } from '@utils/utils';
import { RoomNumberKpi } from '@models/room-number-kpi';
import { RentTransactionPurpose } from '@models/rent-transaction-purpose';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogService } from '@services/dialog.service';
import { RegisterServiceMixin } from '@mixins/register-service-mixin';
import { ServiceContract } from '@contracts/service-contract';
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
  loadRentDefaults(criteria: RentCriteriaContract): Observable<RentDefaultValues[]> {
    return this.http.post<RentDefaultValues[]>(this.urlService.URLS.DEFAULT_RENT, criteria);
  }

  loadKpiRoot(kpi: KpiRoot, criteria: RentCriteriaContract): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.url, criteria);
  }

  loadPurposeKpi(kpi: KpiRoot, criteria: Partial<RentCriteriaContract>): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.subUrl!, criteria);
  }

  loadPropertyTypeKpi(kpi: KpiRoot, criteria: Partial<RentCriteriaContract>): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.secondSubUrl!, criteria);
  }

  loadLineChartKpi(kpi: KpiRoot, criteria: Partial<RentCriteriaContract>): Observable<KpiModel[]> {
    return this.http.post<KpiModel[]>(kpi.lineChart!, criteria);
  }

  @CastResponse(() => RentTransaction)
  loadKpiTransactions(criteria: Partial<RentCriteriaContract>): Observable<RentTransaction[]> {
    return this.http.post<RentTransaction[]>(this.urlService.URLS.RENT_KPI29, criteria);
  }

  @CastResponse(() => Top10Model)
  loadTop10BasedOnCriteria(item: Lookup, criteria: Partial<RentCriteriaContract>): Observable<Top10Model[]> {
    return this.http.post<Top10Model[]>(item.url, criteria);
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

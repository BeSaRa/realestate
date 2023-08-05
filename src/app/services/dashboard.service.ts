import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { UrlService } from '@services/url.service';
import { RentDefaultValues } from '@models/rent-default-values';
import { CastResponse } from 'cast-response';
import { KpiRoot } from '@models/kpiRoot';
import { KpiModel } from '@models/kpi-model';
import { RentTransaction } from '@models/rent-transaction';
import { Lookup } from '@models/lookup';
import { Top10Model } from '@models/top-10-model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private urlService = inject(UrlService);

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
}

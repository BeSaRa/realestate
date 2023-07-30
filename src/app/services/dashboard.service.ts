import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { UrlService } from '@services/url.service';
import { RentDefaultValues } from '@models/rent-default-values';
import { CastResponse } from 'cast-response';
import { KpiRoot } from '@models/kpiRoot';
import { KpiModel } from '@models/kpi-model';

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

  loadKpiRoot(kpi: KpiRoot, criteria: RentCriteriaContract): Observable<any[]> {
    return this.http.post<any[]>(kpi.url, criteria);
  }

  loadPurposeKpi(kpi: KpiRoot, criteria: Partial<RentCriteriaContract>): Observable<KpiModel[]> {
    const entities = Object.entries(this.urlService.URLS);
    entities.forEach((i) => {
      i[1] === kpi.subUrl ? console.log(i[0]) : null;
    });
    delete criteria.bedRoomsCount;
    return this.http.post<KpiModel[]>(kpi.subUrl!, criteria);
  }

  loadPropertyTypeKpi(kpi: KpiRoot, criteria: Partial<RentCriteriaContract>): Observable<KpiModel[]> {
    const entities = Object.entries(this.urlService.URLS);
    entities.forEach((i) => {
      i[1] === kpi.secondSubUrl ? console.log(i[0]) : null;
    });
    delete criteria.bedRoomsCount;
    return this.http.post<KpiModel[]>(kpi.secondSubUrl!, criteria);
  }
}

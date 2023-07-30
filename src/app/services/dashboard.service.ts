import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RentCriteriaContract } from '@contracts/rent-criteria-contract';
import { UrlService } from '@services/url.service';
import { RentDefaultValues } from '@models/rent-default-values';
import { CastResponse } from 'cast-response';
import { KpiRoot } from '@models/kpiRoot';

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

  loadKpiRoot(kpi: KpiRoot, criteria: RentCriteriaContract): Observable<any> {
    return this.http.post(kpi.url, criteria);
  }

  loadKpiSub(kpi: KpiRoot, criteria: Partial<RentCriteriaContract>): Observable<any> {
    criteria.propertyTypeList = [39];
    criteria.issueDateStartMonth = 1;
    criteria.issueDateEndMonth = 12;
    criteria.issueDateQuarterList = [1, 2, 3, 4];
    criteria.municipalityId = 1;
    delete criteria.zoneId;
    return this.http.post(kpi.subUrl!, criteria);
  }

  loadKpiSecondSub(kpi: KpiRoot, criteria: RentCriteriaContract): Observable<any> {
    return this.http.post(kpi.secondSubUrl!, criteria);
  }
}

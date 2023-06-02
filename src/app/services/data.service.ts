import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { KpiContract } from '@contracts/kpi-contract';
import { MunicipalityContract } from '@contracts/municipality-contract';
import { CategoryContract } from '@contracts/category-contract';
import { range } from '@utils/utils';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  http = inject(HttpClient);
  years: number[] = range(2006, 2023);
  municipalities: MunicipalityContract[] = [];
  categories: CategoryContract[] = [];
  pricePerSQRF: KpiContract[] = [];
  avgUnitPrice: KpiContract[] = [];
  sellCount: KpiContract[] = [];

  mortCounts: KpiContract[] = [];
  mortValues: KpiContract[] = [];
  mortVsSellCounts: KpiContract[] = [];
  mortVsSellValues: KpiContract[] = [];

  private load<T>(fileName: string): Observable<T> {
    return this.http.get<T>('assets/data/' + fileName);
  }

  loadMunicipalities(): Observable<MunicipalityContract[]> {
    return this.load<MunicipalityContract[]>('municipalities.json').pipe(tap((value) => (this.municipalities = value)));
  }

  loadCategories(): Observable<CategoryContract[]> {
    return this.load<CategoryContract[]>('categories.json').pipe(tap((value) => (this.categories = value)));
  }

  loadKPIPricePerSqrf(): Observable<KpiContract[]> {
    return this.load<KpiContract[]>('kpi1_price_per_sqrf.json').pipe(tap((data) => (this.pricePerSQRF = data)));
  }

  loadKPIAvgUnitPrice(): Observable<KpiContract[]> {
    return this.load<KpiContract[]>('kpi2_avg_unit_price.json').pipe(tap((data) => (this.avgUnitPrice = data)));
  }

  loadKPISellCount(): Observable<KpiContract[]> {
    return this.load<KpiContract[]>('kpi3_sell_count.json').pipe(tap((data) => (this.sellCount = data)));
  }

  loadKPIMortCount(): Observable<KpiContract[]> {
    return this.load<KpiContract[]>('kpi1_mort_transactions_count.json').pipe(tap((data) => (this.mortCounts = data)));
  }

  loadKPIMortValue(): Observable<KpiContract[]> {
    return this.load<KpiContract[]>('kpi2_mort_transactions_value.json').pipe(tap((data) => (this.mortValues = data)));
  }

  loadKPIMortVsSellCount(): Observable<KpiContract[]> {
    return this.load<KpiContract[]>('chart_mort_vs_sell_transaction_count.json').pipe(
      tap((data) => (this.mortVsSellCounts = data))
    );
  }

  loadKPIMortVsSellValue(): Observable<KpiContract[]> {
    return this.load<KpiContract[]>('chart_mort_vs_sell_transaction_value.json').pipe(
      tap((data) => (this.mortVsSellValues = data))
    );
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { KpiContract } from '@contracts/kpi-contract';
import { MunicipalityContract } from '@contracts/municipality-contract';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  http = inject(HttpClient);
  yearsMap: Record<number, number> = {};
  municipalitiesMap: Record<number, string> = {};
  years: number[] = [];
  municipalities: MunicipalityContract[] = [];
  pricePerSQRF: KpiContract[] = [];
  avgUnitPrice: KpiContract[] = [];
  sellCount: KpiContract[] = [];

  private load(fileName: string): Observable<KpiContract[]> {
    return this.http.get<KpiContract[]>('assets/data/' + fileName);
  }

  loadKPIPricePerSqrf(): Observable<KpiContract[]> {
    return this.load('kpi1_price_per_sqrf.json').pipe(tap((data) => (this.pricePerSQRF = data)));
  }

  loadKPIAvgUnitPrice(): Observable<KpiContract[]> {
    return this.load('kpi2_avg_unit_price.json').pipe(tap((data) => (this.avgUnitPrice = data)));
  }

  loadKPISellCount(): Observable<KpiContract[]> {
    return this.load('kpi3_sell_count.json').pipe(tap((data) => (this.sellCount = data)));
  }

  prepareYearsAndMunicipalities(data: KpiContract[]): void {
    data.forEach((item) => {
      this.municipalitiesMap[item.code] = item.municipality;
      this.yearsMap[item.year] = item.year;
    });
    this.years = Object.keys(this.yearsMap).map(Number);
    this.municipalities = Object.entries(this.municipalitiesMap).map(([code, name]) => {
      return {
        name: name,
        code: Number(code),
      };
    });
  }
}

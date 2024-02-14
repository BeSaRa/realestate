import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { maskSeparator } from '@constants/mask-separator';
import { FlyerCriteriaContract } from '@contracts/flyer-criteria-contract';
import { FlyerCompositeTransaction } from '@models/flyer-composite-transaction';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { groupBy } from '@utils/utils';
import { NgxMaskPipe } from 'ngx-mask';
import { Observable, finalize, map, take } from 'rxjs';

@Component({
  selector: 'app-flyer-composite-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, YoyIndicatorComponent, FormatNumbersPipe, NgxMaskPipe, MatProgressBarModule],
  templateUrl: './flyer-composite-table.component.html',
  styleUrl: './flyer-composite-table.component.scss',
})
export class FlyerCompositeTableComponent implements OnChanges {
  @Input({ required: true }) dataUrl!: string;
  @Input({ required: true }) criteria!: FlyerCriteriaContract;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  lookupService = inject(LookupService);

  isLoading = false;

  readonly maskSeparator = maskSeparator;

  compositeTransactions: FlyerCompositeTransaction[][] = [];
  compositeYears!: { selectedYear: number; previousYear: number };
  compositeTransactionsColumns = [
    'municipality-cell',
    'firstYear1',
    'firstYear2',
    'firstYoy',
    'secondYear1',
    'secondYear2',
    'secondYoy',
  ];
  compositeTransactionsExtraColumns = ['municipality-head', 'count', 'value'];

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['dataUrl'] && changes['dataUrl'].currentValue !== changes['dataUrl'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (this.criteria && this.dataUrl) this.loadCompositeTransactions();
    }
  }

  loadCompositeTransactions(): void {
    this.isLoading = true;
    this.dashboardService
      .loadComponsiteTransacitons(this.dataUrl, this.criteria)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .pipe(this._mapCompositeTransactions)
      .subscribe((value) => {
        this.compositeTransactions = value.items;
        this.compositeYears = value.years;
      });
  }

  getMuniciplaityNames(municipalityId: number) {
    return this.lookupService.sellMunicipalitiesMap[municipalityId].getNames();
  }

  private _mapCompositeTransactions = (
    compositeTransactions: Observable<FlyerCompositeTransaction[]>
  ): Observable<{
    years: { selectedYear: number; previousYear: number };
    items: FlyerCompositeTransaction[][];
  }> => {
    return compositeTransactions
      .pipe(
        map((values) => {
          return values;
        }),
        map((values) => {
          return Object.values(groupBy(values, (x: FlyerCompositeTransaction) => x.municipalityId));
        })
      )
      .pipe(
        map((values) => {
          const years = [...new Set(values.flat().map((x) => x.issueYear))].sort();
          values.forEach((item) => {
            if (item.length == 2) return;
            else if (item.length == 1) {
              const secondCompositeTransaction =
                item[0].issueYear == years[0]
                  ? new FlyerCompositeTransaction().clone<FlyerCompositeTransaction>({
                      issueYear: years[1],
                      municipalityId: item[0].municipalityId,
                      kpi1YoYVal: -100,
                      kpi2YoYVal: -100,
                    })
                  : new FlyerCompositeTransaction().clone<FlyerCompositeTransaction>({
                      issueYear: years[0],
                      municipalityId: item[0].municipalityId,
                      kpi1YoYVal: 100,
                      kpi2YoYVal: 100,
                    });
              item.push(secondCompositeTransaction);
            }
          });
          return {
            years: {
              previousYear: years[1] ? years[0] : years[0] - 1,
              selectedYear: years[1] ? years[1] : years[0],
            },
            items: values,
          };
        })
      );
  };
}

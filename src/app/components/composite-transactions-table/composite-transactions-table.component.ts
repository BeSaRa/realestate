import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { DashboardService } from '@services/dashboard.service';
import { CompositeTransaction } from '@models/composite-transaction';
import { LookupService } from '@services/lookup.service';
import { CriteriaSpecificTerms, CriteriaTerms } from '@models/criteria-specific-terms';
import { CriteriaContract } from '@contracts/criteria-contract';
import { Observable, finalize, map, take } from 'rxjs';
import { groupBy } from '@utils/utils';
import { MatTableModule } from '@angular/material/table';
import { maskSeparator } from '@constants/mask-separator';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { FormatNumbersPipe } from '@pipes/format-numbers.pipe';
import { NgxMaskPipe } from 'ngx-mask';
import { CustomTooltipDirective } from '@directives/custom-tooltip.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-composite-transactions-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    YoyIndicatorComponent,
    FormatNumbersPipe,
    NgxMaskPipe,
    CustomTooltipDirective,
    MatProgressSpinnerModule,
  ],
  templateUrl: './composite-transactions-table.component.html',
  styleUrls: ['./composite-transactions-table.component.scss'],
})
export class CompositeTransactionsTableComponent implements OnChanges {
  @Input() type: 'rent' | 'sell' = 'rent';
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input({ required: true }) dataUrl!: string;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  lookupService = inject(LookupService);

  isLoading = false;

  compositeTransactions: CompositeTransaction[][] = [];
  compositeYears!: { selectedYear: number; previousYear: number };
  compositeTransactionsColumns = [
    'municipality',
    'firstYear1',
    'firstYear2',
    'firstYoy',
    'secondYear1',
    'secondYear2',
    'secondYoy',
    'thirdYear1',
    'thirdYear2',
    'thirdYoy',
  ];
  compositeTransactionsExtraColumns = ['contractCounts', 'contractValues', 'avgContract'];
  compositeAvgCriteriaTerms = new CriteriaSpecificTerms([
    { criteriaKey: 'propertyTypeList', term: CriteriaTerms.SINGLE_NOT_ALL },
    { criteriaKey: 'purposeList', term: CriteriaTerms.SINGLE_NOT_ALL },
  ]);

  readonly maskSeparator = maskSeparator;

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
    return (
      this.type === 'rent'
        ? this.lookupService.rentMunicipalitiesMap[municipalityId]
        : this.lookupService.sellMunicipalitiesMap[municipalityId]
    ).getNames();
  }

  private _mapCompositeTransactions = (
    compositeTransactions: Observable<CompositeTransaction[]>
  ): Observable<{
    years: { selectedYear: number; previousYear: number };
    items: CompositeTransaction[][];
  }> => {
    return compositeTransactions
      .pipe(
        map((values) => {
          return values;
        }),
        map((values) => {
          // instead of chunk each two consecutive items, we should group by municipalityId
          // since may one municipality has no transaction in current or previous year
          // as fetched data shows
          return Object.values(groupBy(values, (x: CompositeTransaction) => x.municipalityId));
          // return [...chunks(values, 2)];
        })
      )
      .pipe(
        map((values) => {
          // get the distinct years values instead of using first item, since
          // it may have only one transaction
          const years = [...new Set(values.flat().map((x) => x.issueYear))].sort();

          // if some item has only one transaction fill another one with
          // appropriate values i.e., zeros for kpi values and 100 or -100 to YoY values
          values.forEach((item) => {
            if (item.length == 2) return;
            else if (item.length == 1) {
              const secondCompositeTransaction =
                item[0].issueYear == years[0]
                  ? new CompositeTransaction().clone<CompositeTransaction>({
                      issueYear: years[1],
                      municipalityId: item[0].municipalityId,
                      kpi1YoYVal: -100,
                      kpi2YoYVal: -100,
                      kpi3YoYVal: -100,
                    })
                  : new CompositeTransaction().clone<CompositeTransaction>({
                      issueYear: years[0],
                      municipalityId: item[0].municipalityId,
                      kpi1YoYVal: 100,
                      kpi2YoYVal: 100,
                      kpi3YoYVal: 100,
                    });
              item.push(secondCompositeTransaction);
            }
          });
          return {
            years: {
              previousYear: years[1] ? years[0] : years[0] - 1, //values[0][0].issueYear,
              selectedYear: years[1] ? years[1] : years[0], //values[0][1].issueYear,
            },
            items: values,
          };
        })
      );
  };
}

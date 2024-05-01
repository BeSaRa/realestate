import { AddSectionToExcelSheet } from '@abstracts/add-section-to-excel-sheet';
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
import { Workbook, Worksheet } from 'exceljs';
import { NgxMaskPipe } from 'ngx-mask';
import { Observable, finalize, map, take } from 'rxjs';

@Component({
  selector: 'app-flyer-composite-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, YoyIndicatorComponent, FormatNumbersPipe, NgxMaskPipe, MatProgressBarModule],
  templateUrl: './flyer-composite-table.component.html',
  styleUrl: './flyer-composite-table.component.scss',
})
export class FlyerCompositeTableComponent extends AddSectionToExcelSheet implements OnChanges {
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

  override addToExcelSheet(workbook: Workbook, worksheet: Worksheet): void {
    this.excelService.addHeaderRow(worksheet, [this.lang.map.sell_statistics_by_municipality]);
    worksheet.mergeCells(worksheet.rowCount, 1, worksheet.rowCount, 7);

    this.excelService.addSubHeaderRow(worksheet, [
      this.lang.map.municipal,
      this.lang.map.transactions_count,
      '',
      '',
      this.lang.map.transactions_cost,
    ]);

    this.excelService.addSubHeaderRow(worksheet, [
      '',
      this.compositeYears?.previousYear,
      this.compositeYears?.selectedYear,
      this.lang.map.change + '(YOY)',
      this.compositeYears?.previousYear,
      this.compositeYears?.selectedYear,
      this.lang.map.change + '(YOY)',
    ]);

    worksheet.mergeCells(worksheet.rowCount - 1, 1, worksheet.rowCount, 1);
    worksheet.mergeCells(worksheet.rowCount - 1, 2, worksheet.rowCount - 1, 4);
    worksheet.mergeCells(worksheet.rowCount - 1, 5, worksheet.rowCount - 1, 7);

    this.compositeTransactions.forEach((_, i) => {
      const _row = this.excelService.addDataRow(
        worksheet,
        [
          this.getMuniciplaityNames(this.compositeTransactions[i][0].municipalityId),
          this.compositeTransactions[i][0].kpi1Val,
          this.compositeTransactions[i][1].kpi1Val,
          (this.compositeTransactions[i][1].kpi1YoYVal ?? 0) / 100,
          this.compositeTransactions[i][0].kpi2Val,
          this.compositeTransactions[i][1].kpi2Val,
          (this.compositeTransactions[i][1].kpi2YoYVal ?? 0) / 100,
        ],
        i
      );

      [_row.getCell(2), _row.getCell(3), _row.getCell(5), _row.getCell(6)].forEach((c) => (c.numFmt = '#,##0'));
      this.excelService.stylePercentCell(_row.getCell(4), this.compositeTransactions[i][1].kpi1YoYVal ?? 0);
      this.excelService.stylePercentCell(_row.getCell(7), this.compositeTransactions[i][1].kpi2YoYVal ?? 0);
    });
  }
}

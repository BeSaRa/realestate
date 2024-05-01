import { AddSectionToExcelSheet } from '@abstracts/add-section-to-excel-sheet';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { AppColors } from '@constants/app-colors';
import { FlyerCriteriaContract } from '@contracts/flyer-criteria-contract';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { DashboardService } from '@services/dashboard.service';
import { TranslationService } from '@services/translation.service';
import { Workbook, Worksheet } from 'exceljs';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-flyer-summary',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, ChangeIndicatorComponent],
  templateUrl: './flyer-summary.component.html',
  styleUrls: ['./flyer-summary.component.scss'],
})
export class FlyerSummaryComponent extends OnDestroyMixin(AddSectionToExcelSheet) implements OnChanges {
  @Input() indicatorType: 'sell' | 'rent' | 'mort' = 'sell';
  @Input({ required: true }) dataUrls!: { valueUrl: string; countUrl: string };
  @Input({ required: true }) criteria!: FlyerCriteriaContract;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);

  data = { value: 0, valueYoy: 0, count: 0, countYoy: 0 };
  isLoading = false;
  isHovered = false;

  private _titles = {
    sell: () => this.lang.map.sell,
    rent: () => this.lang.map.rent,
    mort: () => this.lang.map.mortgage,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['dataUrls'] && changes['dataUrls'].currentValue !== changes['dataUrls'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.dataUrls || !this.criteria) return;
      this.loadData();
    }
  }

  getTitle() {
    return this._titles[this.indicatorType]();
  }

  loadData() {
    this.isLoading = true;
    if (this.criteria.issueDateMonth || this.criteria.issueDateQuarter) this.loadMonthlyOrQuarterlyData();
    else this.loadYearlyData();
  }

  loadYearlyData() {
    this.dashboardService
      .loadFlyerSummaryData(this.dataUrls, this.criteria)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe(([count, value]) => {
        this.data = {
          count: count.getKpiVal(),
          countYoy: count.getKpiYoYVal(),
          value: value.getKpiVal(),
          valueYoy: value.getKpiYoYVal(),
        };
      });
  }

  loadMonthlyOrQuarterlyData() {
    this.dashboardService
      .loadFlyerDurationSummaryData(this.dataUrls, this.criteria)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe(([count, value]) => {
        this.data = {
          count: count.getKpiVal(),
          countYoy: count.getKpiP2PYoY(),
          value: value.getKpiVal(),
          valueYoy: value.getKpiP2PYoY(),
        };
      });
  }

  override addToExcelSheet(workbook: Workbook, worksheet: Worksheet): void {
    const title =
      this.indicatorType === 'sell'
        ? this.lang.map.sell_indicators
        : this.indicatorType === 'rent'
        ? this.lang.map.rental_indicators
        : this.lang.map.mortgage_indicators;

    this.excelService.addHeaderRow(worksheet, [title]);
    worksheet.mergeCells(worksheet.rowCount, 1, worksheet.rowCount, 4);
    this.excelService.addSubHeaderRow(worksheet, [
      this.lang.map.total_number_of_contracts,
      '',
      this.lang.map.total_value_of_contracts,
      '',
    ]);
    worksheet.mergeCells(worksheet.rowCount, 1, worksheet.rowCount, 2);
    worksheet.mergeCells(worksheet.rowCount, 3, worksheet.rowCount, 4);

    const dataRow = worksheet.addRow([
      this.data.count,
      this.data.countYoy / 100,
      this.data.value,
      this.data.valueYoy / 100,
    ]);
    dataRow.alignment = { horizontal: 'center', vertical: 'middle' };
    dataRow.font = { bold: true, color: { argb: AppColors.PRIMARY.slice(1) } };

    [dataRow.getCell(1), dataRow.getCell(3)].forEach((c) => (c.numFmt = '#,##0'));
    [dataRow.getCell(2), dataRow.getCell(4)].forEach((c, i) => {
      this.excelService.stylePercentCell(c, i === 0 ? this.data.countYoy : this.data.valueYoy);
    });
  }
}

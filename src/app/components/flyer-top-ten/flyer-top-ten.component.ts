import { AddSectionToExcelSheet } from '@abstracts/add-section-to-excel-sheet';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';
import { maskSeparator } from '@constants/mask-separator';
import { FlyerCriteriaContract } from '@contracts/flyer-criteria-contract';
import { FlyerAreaKpi } from '@models/flyer-area-kpi';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { formatNumber, minMaxAvg, repeat } from '@utils/utils';
import { Workbook, Worksheet } from 'exceljs';
import { NgxMaskPipe } from 'ngx-mask';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-flyer-top-ten',
  standalone: true,
  imports: [CommonModule, YoyIndicatorComponent, MatProgressBarModule],
  templateUrl: './flyer-top-ten.component.html',
  styleUrls: ['./flyer-top-ten.component.scss'],
})
export class FlyerTopTenComponent extends AddSectionToExcelSheet implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) criteria?: FlyerCriteriaContract;
  @Input({ required: true }) dataUrl!: string;
  @Input() type: 'price' | 'count' = 'count';

  lookupService = inject(LookupService);
  dashboardService = inject(DashboardService);
  maskPipe = inject(NgxMaskPipe);

  areas = this.lookupService.sellLookups.districtList;

  chartData = repeat<FlyerAreaKpi>(new FlyerAreaKpi(), 10);

  minMaxAvg = minMaxAvg(this.chartData.map((i) => i.kpiVal));

  isLoading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['dataUrl'] && changes['dataUrl'].currentValue !== changes['dataUrl'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.dataUrl || !this.criteria) return;
      this.loadData();
    }
  }

  loadData() {
    this.isLoading = true;

    this.dashboardService
      .loadFlyerTop10AreaData(this.dataUrl, this.criteria!)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((data) => {
        this.chartData = data;
        this.chartData.sort((a, b) => b.kpiVal - a.kpiVal);
        this.minMaxAvg = minMaxAvg(this.chartData.map((i) => i.kpiVal));
      });
  }

  getValue(value: number) {
    return this.type === 'price'
      ? (formatNumber(value) as string)
      : (this.maskPipe.transform(value.toFixed(0), maskSeparator.SEPARATOR, {
          thousandSeparator: ',',
        }) as unknown as string);
  }

  getAreaName(item: FlyerAreaKpi) {
    return (
      (this.lookupService.sellDistrictMap[item.areaCode] &&
        this.lookupService.sellDistrictMap[item.areaCode].getNames()) ||
      ''
    );
  }

  notChangeTrackBy() {
    return true;
  }

  override addToExcelSheet(workbook: Workbook, worksheet: Worksheet): void {
    this.excelService.addHeaderRow(worksheet, [this.title]);
    worksheet.mergeCells(worksheet.rowCount, 1, worksheet.rowCount, this.chartData.length);

    const _rows = [
      this.excelService.addSubHeaderRow(
        worksheet,
        this.chartData.map((item) => this.getAreaName(item))
      ),
      this.excelService.addDataRow(
        worksheet,
        this.chartData.map((item) => item.kpiVal ?? 0),
        0
      ),
      this.excelService.addDataRow(
        worksheet,
        this.chartData.map((item) => item.kpiYoYDifference / 100 || 0),
        0
      ),
    ];

    _rows[1].numFmt = '#,##0';
    _rows[2].numFmt = '0.0%';

    _rows[2].eachCell((c, i) => {
      this.excelService.stylePercentCell(c, this.chartData[i - 1].kpiYoYDifference);
    });
  }
}

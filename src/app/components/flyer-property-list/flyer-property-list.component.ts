import { AddSectionToExcelSheet } from '@abstracts/add-section-to-excel-sheet';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FlyerPropertyComponent } from '@components/flyer-property/flyer-property.component';
import { FlyerCriteriaContract } from '@contracts/flyer-criteria-contract';
import { FlyerProperty } from '@models/flyer-property';
import { DashboardService } from '@services/dashboard.service';
import { LookupService } from '@services/lookup.service';
import { TranslationService } from '@services/translation.service';
import { Workbook, Worksheet } from 'exceljs';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-flyer-property-list',
  standalone: true,
  imports: [CommonModule, FlyerPropertyComponent],
  templateUrl: './flyer-property-list.component.html',
  styleUrl: './flyer-property-list.component.scss',
})
export class FlyerPropertyListComponent extends AddSectionToExcelSheet implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) dataUrl!: string;
  @Input({ required: true }) criteria?: FlyerCriteriaContract;
  @Input() useAssetsFrom: 'rent' | 'sell' = 'rent';
  @Input() ignoreLocalImages = true;

  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);
  lookupService = inject(LookupService);

  propertiesData: FlyerProperty[] = [];

  isLoading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['dataUrl'] && changes['dataUrl'].currentValue !== changes['dataUrl'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      if (!this.dataUrl || !this.criteria) return;
      this.loadPropertiesData();
    }
  }

  loadPropertiesData() {
    this.isLoading = true;
    this.dashboardService
      .loadFlyerPropertiesData(this.dataUrl, this.criteria!)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((data) => (this.propertiesData = data));
  }

  getPropertyTypeNames(item: FlyerProperty) {
    return (
      this.useAssetsFrom === 'sell'
        ? this.lookupService.sellPropertyTypeMap[item.propertyTypeId]
        : this.lookupService.rentPropertyTypeMap[item.propertyTypeId]
    ).getNames();
  }

  getPercent(item: FlyerProperty) {
    return (item.yoyDifference ?? item.qoqDifference ?? item.momDifference ?? 0) / 100;
  }

  override addToExcelSheet(workbook: Workbook, worksheet: Worksheet): void {
    this.excelService.addHeaderRow(worksheet, [this.title]);
    worksheet.mergeCells(worksheet.rowCount, 1, worksheet.rowCount, 5);
    this.excelService.addSubHeaderRow(worksheet, [
      this.lang.map.property_type,
      this.lang.map.transactions_count,
      this.lang.map.change,
      this.lang.map.value_average,
      this.lang.map.value_total,
    ]);

    this.propertiesData.forEach((p, i) => {
      const _row = this.excelService.addDataRow(
        worksheet,
        [this.getPropertyTypeNames(p), p.kpiCount, this.getPercent(p), p.kpiValAvg, p.kpiVal],
        i
      );
      [_row.getCell(2), _row.getCell(4), _row.getCell(5)].forEach((c) => (c.numFmt = '#,##0'));
      this.excelService.stylePercentCell(_row.getCell(3), this.getPercent(p));
    });
  }
}

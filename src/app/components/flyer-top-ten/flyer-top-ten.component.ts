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
import { NgxMaskPipe } from 'ngx-mask';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-flyer-top-ten',
  standalone: true,
  imports: [CommonModule, YoyIndicatorComponent, MatProgressBarModule],
  templateUrl: './flyer-top-ten.component.html',
  styleUrls: ['./flyer-top-ten.component.scss'],
})
export class FlyerTopTenComponent implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) criteria!: FlyerCriteriaContract;
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
      .loadFlyerTop10AreaData(this.dataUrl, this.criteria)
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

  notChangeTrackBy() {
    return true;
  }
}

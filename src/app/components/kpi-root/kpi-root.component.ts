import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountUpModule } from 'ngx-countup';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { KpiRoot } from '@models/kpi-root';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { TranslationService } from '@services/translation.service';
import { CriteriaContract } from '@contracts/criteria-contract';
import { CustomTooltipDirective } from '@directives/custom-tooltip.directive';
import { DashboardService } from '@services/dashboard.service';
import { finalize, take } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-kpi-root',
  standalone: true,
  imports: [CommonModule, CountUpModule, ChangeIndicatorComponent, CustomTooltipDirective, MatProgressSpinnerModule],
  templateUrl: './kpi-root.component.html',
  styleUrls: ['./kpi-root.component.scss'],
})
export class KpiRootComponent implements OnChanges {
  @Input({ required: true }) item!: KpiRoot;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input() showYoy = true;

  @Output() itemSelected = new EventEmitter<KpiRoot>();

  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);
  lang = inject(TranslationService);
  dashboardService = inject(DashboardService);

  isHovered = false;
  isCriteriaValid = true;
  isLoading = false;

  get iconUrl() {
    return this.item.iconUrl;
  }

  get whiteIconUrl() {
    const index = this.item.iconUrl.indexOf('.png');
    return this.item.iconUrl.slice(0, index) + '-white' + this.item.iconUrl.slice(index);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['item'] && changes['item'].currentValue !== changes['item'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      this.isCriteriaValid = this.item.criteriaTerms.validate(this.criteria);
      if (this.criteria) this.loadKpiData();
    }
  }

  loadKpiData() {
    if (!this.item.isDataAvailable || !this.isCriteriaValid) return;
    this.isLoading = true;
    this.dashboardService
      .loadKpiRoot(this.item, this.criteria)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((value) => {
        this.item.kpiData = value[0];
        this.item.selected && this.itemSelected.emit(this.item);
      });
  }

  selectItem(): void {
    if (!this.item.isDataAvailable || !this.isCriteriaValid || this.isLoading) return;
    this.isHovered = true;
    this.itemSelected.emit(this.item);
  }
}

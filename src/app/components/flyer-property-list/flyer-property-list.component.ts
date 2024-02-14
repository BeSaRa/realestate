import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FlyerPropertyComponent } from '@components/flyer-property/flyer-property.component';
import { FlyerCriteriaContract } from '@contracts/flyer-criteria-contract';
import { FlyerProperty } from '@models/flyer-property';
import { DashboardService } from '@services/dashboard.service';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-flyer-property-list',
  standalone: true,
  imports: [CommonModule, FlyerPropertyComponent],
  templateUrl: './flyer-property-list.component.html',
  styleUrl: './flyer-property-list.component.scss',
})
export class FlyerPropertyListComponent implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) dataUrl!: string;
  @Input({ required: true }) criteria!: FlyerCriteriaContract;
  @Input() useAssetsFrom: 'rent' | 'sell' = 'rent';
  @Input() ignoreLocalImages = true;

  dashboardService = inject(DashboardService);

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
      .loadFlyerPropertiesData(this.dataUrl, this.criteria)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((data) => (this.propertiesData = data));
  }
}

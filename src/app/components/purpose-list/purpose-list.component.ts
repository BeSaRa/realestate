import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurposeComponent } from '@components/purpose/purpose.component';
import { KpiPurpose } from '@models/kpi-purpose';
import { KpiRoot } from '@models/kpi-root';
import { CriteriaContract } from '@contracts/criteria-contract';
import { DashboardService } from '@services/dashboard.service';
import { finalize, take } from 'rxjs';
import { KpiBaseModel } from '@abstracts/kpi-base-model';
import { KpiBase } from '@models/kpi-base';

@Component({
  selector: 'app-purpose-list',
  standalone: true,
  imports: [CommonModule, PurposeComponent],
  templateUrl: './purpose-list.component.html',
  styleUrls: ['./purpose-list.component.scss'],
})
export class PurposeListComponent implements OnChanges {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) purposeKpiList!: KpiPurpose[];
  @Input({ required: true }) kpiRoot!: KpiRoot;
  @Input({ required: true }) criteria!: CriteriaContract;
  @Input() bindKey = 'purposeId';
  @Input() distanceBetween = false;
  @Input() showYoy = true;

  @Output() purposeSelected = new EventEmitter<KpiPurpose>();

  dashboardService = inject(DashboardService);

  selectedPurpose!: KpiPurpose;

  isLoading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['kpiRoot'] && changes['kpiRoot'].currentValue !== changes['kpiRoot'].previousValue) ||
      (changes['criteria'] && changes['criteria'].currentValue !== changes['criteria'].previousValue)
    ) {
      !this.selectedPurpose && (this.selectedPurpose = this.purposeKpiList[0]);
      if (!this.kpiRoot || !this.criteria) return;

      this.updatePurposeKpis();
    }
  }

  updatePurposeKpis() {
    this.isLoading = true;
    this.dashboardService
      .loadPurposeKpi(this.kpiRoot, this.criteria)
      .pipe(
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((data) => {
        const _purposeKpiData = data.reduce((acc, item) => {
          return { ...acc, [(item as any)[this.bindKey]]: item };
        }, {} as Record<number, KpiBaseModel>);

        this.purposeKpiList.forEach((item) => item.kpiData.resetAllValues());
        this.purposeKpiList.forEach((item) => {
          Object.prototype.hasOwnProperty.call(_purposeKpiData, item.id) && (item.kpiData = _purposeKpiData[item.id]);
        });
        this.updateAllPurpose();
        this.selectPurpose(this.selectedPurpose);
      });
  }

  selectPurpose(item: KpiPurpose) {
    if (this.isLoading) return;
    this.selectedPurpose = item;
    this.purposeKpiList.forEach((i) => {
      item !== i ? (i.selected = false) : (item.selected = true);
    });
    this.purposeSelected.emit(this.selectedPurpose);
  }

  updateAllPurpose(): void {
    const _purpose = this.purposeKpiList.find((i) => i.id === -1);
    const _list = this.purposeKpiList.filter((i) => i.id !== -1);

    let _kpi = 0;
    let _previous = 0;
    let _yoy = 0;

    _list.forEach((item) => {
      _kpi += item.kpiData.getKpiVal();
      _previous += item.kpiData.getKpiPreviousYear();
    });

    _yoy = ((_kpi - _previous) / _previous) * 100;

    if (_purpose) {
      _purpose.kpiData = KpiBase.kpiFactory(this.kpiRoot.hasSqUnit);
      _purpose.kpiData.setAllValues(_kpi, _yoy, 0, 0);
    }
  }
}

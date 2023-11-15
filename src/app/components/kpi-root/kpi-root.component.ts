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

@Component({
  selector: 'app-kpi-root',
  standalone: true,
  imports: [CommonModule, CountUpModule, ChangeIndicatorComponent, CustomTooltipDirective],
  templateUrl: './kpi-root.component.html',
  styleUrls: ['./kpi-root.component.scss'],
})
export class KpiRootComponent implements OnChanges {
  @Input() item!: KpiRoot;
  @Input() showYoy = true;
  @Input() criteria!: CriteriaContract;

  @Output() itemSelected = new EventEmitter<KpiRoot>();

  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);
  lang = inject(TranslationService);

  isHovered = false;
  isCriteriaValid = true;

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
      this.isCriteriaValid = this.item.criteriaTerms.checkIfCriteriaValid(this.criteria);
    }
  }

  selectItem(): void {
    if (!this.item.isDataAvailable || !this.isCriteriaValid) return;
    this.isHovered = true;
    this.itemSelected.emit(this.item);
  }
}

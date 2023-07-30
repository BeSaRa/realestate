import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountUpModule } from 'ngx-countup';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { KpiRoot } from '@models/kpiRoot';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-kpi-root',
  standalone: true,
  imports: [CommonModule, CountUpModule, ChangeIndicatorComponent],
  templateUrl: './kpi-root.component.html',
  styleUrls: ['./kpi-root.component.scss'],
})
export class KpiRootComponent {
  @Input()
  item!: KpiRoot;
  isHovered = false;
  @Output()
  itemSelected = new EventEmitter<KpiRoot>();
  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);
  lang = inject(TranslationService);

  selectItem(): void {
    this.itemSelected.emit(this.item);
  }
}

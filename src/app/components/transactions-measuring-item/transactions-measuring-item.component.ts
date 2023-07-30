import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { CountUpModule } from 'ngx-countup';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { KpiRoot } from '@models/kpiRoot';

@Component({
  selector: 'app-transactions-measuring-item',
  standalone: true,
  imports: [CommonModule, ChangeIndicatorComponent, CountUpModule],
  templateUrl: './transactions-measuring-item.component.html',
  styleUrls: ['./transactions-measuring-item.component.scss'],
})
export class TransactionsMeasuringItemComponent {
  @Input({ required: true }) item!: KpiRoot;
  @Input() type: 'normal' | 'small' = 'normal';

  lang = inject(TranslationService);
  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);

  isHovered = false;

  @Output()
  itemSelected = new EventEmitter<KpiRoot>();

  selectItem(): void {
    this.itemSelected.emit(this.item);
  }
}

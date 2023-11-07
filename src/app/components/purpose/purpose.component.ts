import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { KpiPurpose } from '@models/kpi-purpose';
import { TranslationService } from '@services/translation.service';
import { CountUpModule } from 'ngx-countup';

@Component({
  selector: 'app-purpose',
  standalone: true,
  imports: [CommonModule, CountUpModule, ChangeIndicatorComponent],
  templateUrl: './purpose.component.html',
  styleUrls: ['./purpose.component.scss'],
})
export class PurposeComponent {
  @Input() item!: KpiPurpose;
  @Input() showYoy = true;
  @Input() enableCountup = true;
  @Input() alignHorizontal = true;

  isHovered = false;
  lang = inject(TranslationService);
  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);
}

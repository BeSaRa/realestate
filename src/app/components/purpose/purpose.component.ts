import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { CountUpModule } from 'ngx-countup';
import { ChangeIndicatorComponent } from '@components/change-indicator/change-indicator.component';
import { Lookup } from '@models/lookup';
import { CountUpOptionsContract } from '@contracts/countup-options-contract';
import { NGX_COUNTUP_OPTIONS } from '@constants/injection-tokens';

@Component({
  selector: 'app-purpose',
  standalone: true,
  imports: [CommonModule, CountUpModule, ChangeIndicatorComponent],
  templateUrl: './purpose.component.html',
  styleUrls: ['./purpose.component.scss'],
})
export class PurposeComponent {
  @Input()
  item!: Lookup;
  @Input()
  showYoy = true;
  isHovered = false;
  lang = inject(TranslationService);
  countUpOptions: CountUpOptionsContract = inject(NGX_COUNTUP_OPTIONS);
}

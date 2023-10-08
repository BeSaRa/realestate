import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CUSTOM_TOOLTIP_DATA, CustomTooltipDataContract } from '@directives/custom-tooltip.directive';

@Component({
  selector: 'app-custom-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-tooltip.component.html',
  styleUrls: ['./custom-tooltip.component.scss'],
})
export class CustomTooltipComponent {
  tooltipData = inject<CustomTooltipDataContract>(CUSTOM_TOOLTIP_DATA);
  tooltipClass = 'custom-tooltip-show';
}

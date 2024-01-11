import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LookupService } from '@services/lookup.service';
import { minMaxAvg } from '@utils/utils';
import { YoyIndicatorComponent } from '@components/yoy-indicator/yoy-indicator.component';

@Component({
  selector: 'app-flyer-top-ten',
  standalone: true,
  imports: [CommonModule, YoyIndicatorComponent],
  templateUrl: './flyer-top-ten.component.html',
  styleUrls: ['./flyer-top-ten.component.scss'],
})
export class FlyerTopTenComponent {
  @Input({ required: true }) title!: string;
  @Input() type: 'price' | 'count' = 'count';

  lookupService = inject(LookupService);

  areas = this.lookupService.sellLookups.districtList;

  data = [
    {
      value: 615,
      yoy: 1.7,
      area: this.areas[0],
    },
    {
      value: 751,
      yoy: 9.7,
      area: this.areas[1],
    },
    {
      value: 770,
      yoy: 1.2,
      area: this.areas[2],
    },
    {
      value: 810,
      yoy: 1.2,
      area: this.areas[3],
    },
    {
      value: 856,
      yoy: -1.2,
      area: this.areas[4],
    },
    {
      value: 910,
      yoy: -1.7,
      area: this.areas[5],
    },
    {
      value: 1050,
      yoy: -1.9,
      area: this.areas[6],
    },
    {
      value: 1070,
      yoy: 2.9,
      area: this.areas[7],
    },
    {
      value: 1099,
      yoy: -1.3,
      area: this.areas[8],
    },
    {
      value: 1105,
      yoy: 2.3,
      area: this.areas[9],
    },
  ].sort((a, b) => b.value - a.value);

  minMaxAvg = minMaxAvg(this.data.map((i) => i.value));
}

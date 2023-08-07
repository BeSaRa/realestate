import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppIcons } from '@constants/app-icons';

@Component({
  selector: 'app-yoy-indicator',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './yoy-indicator.component.html',
  styleUrls: ['./yoy-indicator.component.scss'],
})
export class YoyIndicatorComponent {
  protected readonly AppIcons = AppIcons;
  private _val = 0;
  icon = AppIcons.TRIANGLE_UP;
  color: 'text-green-500' | 'text-red-500' = 'text-green-500';

  @Input()
  set value(value: number) {
    this._val = value;
    this.icon = value >= 0 ? AppIcons.TRIANGLE_UP : AppIcons.TRIANGLE_DOWN;
    this.color = value >= 0 ? 'text-green-500' : 'text-red-500';
  }
}

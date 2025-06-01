import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppIcons, AppIconsType } from '@constants/app-icons';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  @Input()
  icon: keyof AppIconsType = 'RELOAD';
  _disabled = false;
  @Input()
  tabindex = '1';
  @Input() iconColor = 'text-primary';
  @Input() backgroundColor = 'bg-transparent';

  @Input()
  set disabled(value: boolean | unknown) {
    this._disabled = coerceBooleanProperty(value);
  }

  get disabled(): boolean {
    return this._disabled;
  }

  onClick($event: MouseEvent) {
    if (this.disabled) {
      $event.stopPropagation();
    }
  }

  get selectedIcon() {
    return AppIcons[this.icon];
  }
}

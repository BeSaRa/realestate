import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIcons, AppIconsType } from '@constants/app-icons';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

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

  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick($event: MouseEvent) {
    if (this.disabled) return;
    this.clicked.emit($event);
  }

  get selectedIcon() {
    return AppIcons[this.icon];
  }
}

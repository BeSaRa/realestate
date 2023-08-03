import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DoCheck, ElementRef, Input, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AppIcons, AppIconsType } from '@constants/app-icons';
import { ButtonTypeContract } from '@contracts/button-type-contract';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements OnInit, DoCheck {
  @Input() disabled = false;
  @Input() inProgress = false;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() buttonStyle: keyof ButtonTypeContract = 'primary';
  @Input() isRounded = false;
  @Input() icon?: keyof AppIconsType;

  host = inject(ElementRef);
  isActive = false;

  overlayEnabled = false;

  ngOnInit(): void {
    this.overlayEnabled = !this.buttonStyle.includes('none') && !this.buttonStyle.includes('outline') && !this.disabled;
  }

  ngDoCheck(): void {
    this.isActive = this.host.nativeElement.classList.contains('active');
  }

  clickEvent($event: MouseEvent) {
    this.disabled && $event.stopPropagation();
  }

  get selectedIcon() {
    return AppIcons[this.icon ?? 'RELOAD'];
  }
}

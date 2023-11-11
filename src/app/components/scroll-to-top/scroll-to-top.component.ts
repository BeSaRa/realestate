import { ChangeDetectionStrategy, Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SideBarDirection } from '@enums/side-bar-direction';
import { AppIcons } from '@constants/app-icons';

const MATERIAL_MODULES = [MatButtonModule, MatIconModule];

@Component({
  standalone: true,
  imports: [...MATERIAL_MODULES, CommonModule],
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollToTopComponent {
  @Input() floating = SideBarDirection.RIGHT;
  @Output() scrollToTop = new EventEmitter<void>();

  onScrollToTop(): void {
    this.scrollToTop.emit();
  }
  getBackToTopStyles() {
    return {
      float: [this.floating],
    };
  }

  protected readonly AppIcons = AppIcons;
}

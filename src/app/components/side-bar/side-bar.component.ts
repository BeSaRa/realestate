import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { ClickOutsideDirective } from '@directives/click-outside.directive';
import { SideBarDirection } from '@enums/side-bar-direction';
import { SideBarService } from '@services/side-bar.service';
import { TranslationService } from '@services/translation.service';
@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
  @Input() direction = SideBarDirection.LEFT;
  @Input() duration = 0.25;
  @Input() width = 300;
  @Input() isAuthenticated = false;

  lang = inject(TranslationService);
  sideBarService = inject(SideBarService);

  getSideBarStyles() {
    return {
      transition: this.direction + ' ' + this.duration + 's, visibility ' + this.duration + 's',
      width: this.width + 'px',
      [this.direction]: this.sideBarService.isOpened() ? 0 : this.width * -1 + 'px',
    };
  }

  outsideClicked() {
    if (this.sideBarService.isOpenTriggered) {
      this.sideBarService.isOpenTriggered = false;
      return;
    }
    this.sideBarService.close();
  }
}

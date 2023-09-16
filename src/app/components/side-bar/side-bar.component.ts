import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { SideBarDirection } from '@enums/side-bar-direction';
import { SideBarService } from '@services/side-bar.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent {
  @Input() direction = SideBarDirection.LEFT;
  @Input() duration = 0.25;
  @Input() width = 300;

  lang = inject(TranslationService);
  sideBarService = inject(SideBarService);

  getSideBarStyles() {
    return {
      transition: this.direction + ' ' + this.duration + 's, visibility ' + this.duration + 's',
      width: this.width + 'px',
      [this.direction]: this.sideBarService.isOpened() ? 0 : this.width * -1 + 'px',
    };
  }
}

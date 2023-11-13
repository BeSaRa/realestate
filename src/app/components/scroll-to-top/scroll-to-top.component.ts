import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, HostListener, inject } from '@angular/core';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { TranslationService } from '@services/translation.service';

@Component({
  standalone: true,
  imports: [CommonModule, IconButtonComponent],
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollToTopComponent {
  lang = inject(TranslationService);

  @HostBinding('class.left-3') get isAlignedLeft() {
    return this.lang.isLtr;
  }

  @HostBinding('class.right-3') get isAlignedRight() {
    return !this.lang.isLtr;
  }

  @HostListener('window:scroll')
  isHidden() {
    return window.scrollY < 120;
  }

  onScrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

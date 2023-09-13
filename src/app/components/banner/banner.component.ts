import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { TranslationService } from '@services/translation.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent {
  lang = inject(TranslationService);
  destroyed = new Subject<void>();

  currentScreenSize: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  buttonSizeMap = new Map<string, 'sm' | 'md' | 'lg' | 'xl'>([
    [Breakpoints.Small, 'sm'],
    [Breakpoints.Medium, 'md'],
    [Breakpoints.Large, 'lg'],
    [Breakpoints.XLarge, 'xl'],
  ]);
  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntil(this.destroyed))
      .subscribe((result) => {
        for (const query of Object.keys(result.breakpoints)) {
          if (result.breakpoints[query]) {
            this.currentScreenSize = this.buttonSizeMap.get(query) ?? 'md';
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}

import { Component, ContentChild, Directive, Input, TemplateRef, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { TranslationService } from '@services/translation.service';
import { filter, interval, tap } from 'rxjs';
import { HomeSlider } from '@models/home-slider';

@Directive({
  selector: '[appSliderTemplate]',
  standalone: true,
})
export class SliderTemplateDirective {
  templateRef = inject(TemplateRef);
}

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, IconButtonComponent],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  animations: [
    trigger('fade', [state('void', style({ opacity: 0 })), transition('void => *', [animate('0.5s ease-in-out')])]),
  ],
})
export class SliderComponent implements OnInit {
  ngOnInit(): void {
    this.interval$.subscribe();
  }

  @Input({ required: true }) list!: HomeSlider[];

  @ContentChild(SliderTemplateDirective) slideTemplateRef!: SliderTemplateDirective;

  lang = inject(TranslationService);

  counter = 0;

  isHovered = false;

  interval$ = interval(10000).pipe(
    filter(() => !this.isHovered),
    tap(() => {
      this.hasNext() ? this.showNextSlide() : this.showPreviousSlide();
    })
  );

  showNextSlide() {
    if (this.counter < this.list.length - 1) this.counter += 1;
  }

  showPreviousSlide() {
    if (this.counter > 0) this.counter -= 1;
  }

  hasNext(): boolean {
    return this.counter < this.list.length - 1;
  }

  hasPrev(): boolean {
    return this.counter > 0;
  }

  @HostListener('mouseleave')
  @HostListener('mouseover')
  toggleHover(): void {
    this.isHovered = !this.isHovered;
  }
}

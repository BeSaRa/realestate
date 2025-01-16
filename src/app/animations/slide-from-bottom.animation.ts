import { animate, style, transition, trigger } from '@angular/animations';

export const SlideFromBottom = trigger('slideFromBottom', [
  transition(':enter', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
  transition(':leave', [animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))]),
]);

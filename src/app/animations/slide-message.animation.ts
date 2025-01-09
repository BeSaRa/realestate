import { animate, style, transition, trigger } from '@angular/animations';

export const SlideMessageAnimation = trigger('slideMessage', [
  transition('void => *', [
    style({
      opacity: 0,
      transform: 'translateY(100%)',
    }),
    animate(
      '150ms ease-in-out',
      style({
        opacity: 1,
        transform: 'translateY(0)',
      })
    ),
  ]),
]);

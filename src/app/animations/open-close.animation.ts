import { animate, state, style, transition, trigger } from '@angular/animations';

export const OpenCloseAnimation = trigger('openClose', [
  state(
    'open',
    style({
      width: '*',
      height: '*',
      opacity: 1,
    })
  ),
  state(
    'close',
    style({
      width: 0,
      height: 0,
      opacity: 0,
    })
  ),
  transition('* <=> *', animate('150ms ease-in-out')),
]);

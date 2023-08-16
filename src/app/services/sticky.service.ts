import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StickyService {
  isSticky = signal(false);
  isFilterSticky = signal(false);
}

import { Injectable, signal, effect, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StickyService {
  isSticky = signal(false);

  // isFilterSticky = signal(false);
  scrollY = signal(0);
  filterHeigtht = signal(0);

  isFilterSticky = computed(() => this.scrollY() > 420 + this.filterHeigtht());
}

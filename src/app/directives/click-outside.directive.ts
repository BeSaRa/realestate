import { Directive, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, inject } from '@angular/core';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Subject, filter, fromEvent, takeUntil } from 'rxjs';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective extends OnDestroyMixin(class {}) implements OnInit {
  @Input() emitClickOutsideEvent = true;
  @Output() appClickOutside = new EventEmitter<Event>();

  zone = inject(NgZone);
  elementRef = inject(ElementRef);

  private _oustsideClicked$ = new Subject<Event>();

  ngOnInit(): void {
    this._listenToOutsidClick();
  }

  private _listenToOutsidClick() {
    this.zone.runOutsideAngular(() => {
      fromEvent(document, 'click')
        .pipe(filter(() => this.emitClickOutsideEvent))
        .subscribe(this._oustsideClicked$);
    });

    this._oustsideClicked$
      .pipe(
        takeUntil(this.destroy$),
        filter((event) => !this.elementRef.nativeElement.contains(event.target))
      )
      .subscribe((event) => this.zone.run(() => this.appClickOutside.emit(event)));
  }
}

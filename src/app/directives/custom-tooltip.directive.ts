import { Directionality } from '@angular/cdk/bidi';
import { ConnectedPosition, Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  InjectionToken,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  inject,
} from '@angular/core';
import { CustomTooltipComponent } from '@components/custom-tooltip/custom-tooltip.component';
import { BehaviorSubject, delay, of, Subject, switchMap, takeUntil } from 'rxjs';

export interface CustomTooltipDataContract {
  tooltipTemplate: TemplateRef<any>;
  tooltipContent: any;
}

export const CUSTOM_TOOLTIP_DATA = new InjectionToken<CustomTooltipDataContract>('CUSTOM_TOOLTIP_DATA');

@Directive({
  selector: '[appCustomTooltip]',
  standalone: true,
})
export class CustomTooltipDirective implements OnInit, OnDestroy {
  @Input() tooltipTemplate?: TemplateRef<any>;
  @Input() tooltipContent: any;
  @Input() tooltipPosition?: ConnectedPosition;
  @Input() delay = 0;

  private _elementRef = inject(ElementRef);
  private _overlay = inject(Overlay);
  private _overlayPositionBuilder = inject(OverlayPositionBuilder);
  private _injector = inject(Injector);
  private _dir = inject(Directionality);

  private _overlayRef!: OverlayRef;
  private _tooltipRef?: ComponentRef<CustomTooltipComponent>;

  private _mouseenter$ = new BehaviorSubject(false);

  destroy$ = new Subject<void>();

  ngOnInit(): void {
    const _postitionStrategy = this._overlayPositionBuilder.flexibleConnectedTo(this._elementRef).withPositions(
      this.tooltipPosition
        ? [this.tooltipPosition]
        : this.tooltipTemplate
        ? [
            {
              originX: 'center',
              originY: 'center',
              overlayX: 'start',
              overlayY: 'top',
            },
            {
              originX: 'center',
              originY: 'center',
              overlayX: 'center',
              overlayY: 'top',
            },
            {
              originX: 'center',
              originY: 'center',
              overlayX: 'end',
              overlayY: 'top',
            },
          ]
        : [
            {
              originX: 'center',
              originY: 'top',
              overlayX: 'center',
              overlayY: 'bottom',
            },
            {
              originX: 'center',
              originY: 'bottom',
              overlayX: 'center',
              overlayY: 'top',
            },
          ]
    );
    this._overlayRef = this._overlay.create({
      positionStrategy: _postitionStrategy,
      direction: this._dir,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    this._listenToMouseEnter();
  }

  @HostListener('mouseenter') show() {
    if (this._tooltipRef || !this.tooltipContent) return;
    this._mouseenter$.next(true);
  }

  @HostListener('mouseleave') hide() {
    this._mouseenter$.next(false);
  }

  private _listenToMouseEnter() {
    this._mouseenter$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((v) => {
          if (v) return of(v).pipe(delay(this.delay));
          return of(v);
        })
      )
      .subscribe((v) => {
        if (v) {
          const _injector = Injector.create({
            parent: this._injector,
            providers: [
              {
                provide: CUSTOM_TOOLTIP_DATA,
                useValue: {
                  tooltipTemplate: this.tooltipTemplate,
                  tooltipContent: this.tooltipContent,
                } as CustomTooltipDataContract,
              },
            ],
          });

          this._tooltipRef = this._overlayRef.attach(
            new ComponentPortal<CustomTooltipComponent>(CustomTooltipComponent, null, _injector)
          );
        } else {
          this._tooltipRef && (this._tooltipRef.instance.tooltipClass = 'custom-tooltip-hide');
          this._tooltipRef?.destroy();
          this._tooltipRef = undefined;
          this._overlayRef.detach();
        }
      });
  }

  ngOnDestroy(): void {
    this._overlayRef.detach();
    this._overlayRef.dispose();

    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}

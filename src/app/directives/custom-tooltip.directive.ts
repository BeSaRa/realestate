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
import { Subject } from 'rxjs';

export interface CustomTooltipDataContract {
  tooltipContent: TemplateRef<any>;
  tooltipContentContext: any;
}

export const CUSTOM_TOOLTIP_DATA = new InjectionToken<CustomTooltipDataContract>('CUSTOM_TOOLTIP_DATA');

@Directive({
  selector: '[appCustomTooltip]',
  standalone: true,
})
export class CustomTooltipDirective implements OnInit, OnDestroy {
  @Input({ required: true }) tooltipContent!: TemplateRef<any> | null;
  @Input({ required: true }) tooltipContentContext!: any;
  @Input({}) tooltipPosition?: ConnectedPosition;

  private _elementRef = inject(ElementRef);
  private _overlay = inject(Overlay);
  private _overlayPositionBuilder = inject(OverlayPositionBuilder);
  private _injector = inject(Injector);
  private _dir = inject(Directionality);

  private _overlayRef!: OverlayRef;

  private _tooltipRef?: ComponentRef<CustomTooltipComponent>;

  destroy$ = new Subject<void>();

  ngOnInit(): void {
    const _postitionStrategy = this._overlayPositionBuilder.flexibleConnectedTo(this._elementRef).withPositions(
      this.tooltipPosition
        ? [this.tooltipPosition]
        : [
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
    );
    this._overlayRef = this._overlay.create({
      positionStrategy: _postitionStrategy,
      direction: this._dir,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });
  }

  @HostListener('mouseenter') show() {
    if (this._tooltipRef || !this.tooltipContent) return;

    const _injector = Injector.create({
      parent: this._injector,
      providers: [
        {
          provide: CUSTOM_TOOLTIP_DATA,
          useValue: {
            tooltipContent: this.tooltipContent,
            tooltipContentContext: this.tooltipContentContext,
          } as CustomTooltipDataContract,
        },
      ],
    });

    this._tooltipRef = this._overlayRef.attach(
      new ComponentPortal<CustomTooltipComponent>(CustomTooltipComponent, null, _injector)
    );
  }

  @HostListener('mouseleave') hide() {
    this._tooltipRef && (this._tooltipRef.instance.tooltipClass = 'custom-tooltip-hide');
    this._tooltipRef = undefined;
    this._overlayRef.detach();
  }

  ngOnDestroy(): void {
    this._overlayRef.detach();

    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}

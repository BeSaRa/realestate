import { Directive, Input, OnChanges, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { ExtraHeaderPortalBridgeService } from '@services/extra-header-portal-bridge.service';

@Directive({
  selector: '[appExtraHeaderPortal]',
  standalone: true,
})
export class ExtraHeaderPortalBridgeDirective implements OnChanges, OnInit {
  @Input() extraHeaderSubTitle?: string;

  templateRef = inject(TemplateRef, { optional: true });
  viewRef = inject(ViewContainerRef);

  private _portalService = inject(ExtraHeaderPortalBridgeService);

  ngOnChanges(): void {
    this._portalService.setSubTitle(this.extraHeaderSubTitle);
  }

  ngOnInit(): void {
    this._portalService.setPortal(this.templateRef, this.viewRef);
  }
}

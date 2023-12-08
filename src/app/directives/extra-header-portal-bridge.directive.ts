import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { ExtraHeaderPortalBridgeService } from '@services/extra-header-portal-bridge.service';

@Directive({
  selector: '[appExtraHeaderPortal]',
  standalone: true,
})
export class ExtraHeaderPortalBridgeDirective implements OnInit {
  @Input() extraHeaderSubTitle?: string;

  templateRef = inject(TemplateRef, { optional: true });
  viewRef = inject(ViewContainerRef);

  private _portalService = inject(ExtraHeaderPortalBridgeService);

  ngOnInit(): void {
    this._portalService.setSubTitle(this.extraHeaderSubTitle);
    this._portalService.setPortal(this.templateRef, this.viewRef);
  }
}

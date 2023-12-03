import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ExtraHeaderPortalBridgeService } from '@services/extra-header-portal-bridge.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-extra-header',
  standalone: true,
  imports: [CommonModule, PortalModule],
  templateUrl: './extra-header.component.html',
  styleUrls: ['./extra-header.component.scss'],
})
export class ExtraHeaderComponent {
  lang = inject(TranslationService);
  portalService = inject(ExtraHeaderPortalBridgeService);
}

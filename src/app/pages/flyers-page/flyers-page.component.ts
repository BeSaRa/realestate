import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@services/translation.service';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';

@Component({
  selector: 'app-flyers-page',
  standalone: true,
  imports: [CommonModule, ExtraHeaderPortalBridgeDirective],
  templateUrl: './flyers-page.component.html',
  styleUrls: ['./flyers-page.component.scss'],
})
export default class FlyersPageComponent {
  lang = inject(TranslationService);
}

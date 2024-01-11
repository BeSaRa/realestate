import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@components/button/button.component';
import { FlyerPropertyComponent } from '@components/flyer-property/flyer-property.component';
import { FlyerSummaryComponent } from '@components/flyer-summary/flyer-summary.component';
import { FlyerTopTenComponent } from '@components/flyer-top-ten/flyer-top-ten.component';
import { PriceRangeComponent } from '@components/price-range/price-range.component';
import { ExtraHeaderPortalBridgeDirective } from '@directives/extra-header-portal-bridge.directive';
import { DurationEndpoints } from '@enums/durations';
import { Lookup } from '@models/lookup';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-flyers-page',
  standalone: true,
  imports: [
    CommonModule,
    ExtraHeaderPortalBridgeDirective,
    FlyerSummaryComponent,
    FlyerTopTenComponent,
    FlyerPropertyComponent,
    ButtonComponent,
    PriceRangeComponent,
  ],
  templateUrl: './flyers-page.component.html',
  styleUrls: ['./flyers-page.component.scss'],
})
export default class FlyersPageComponent {
  lang = inject(TranslationService);

  readonly DurationTypes = DurationEndpoints;
  selectedDurationType = DurationEndpoints.YEARLY;

  isLoading = false;

  propertyTypes = [
    new Lookup().clone<Lookup>({
      enName: 'Land',
      arName: 'أرض',
      lookupKey: 3,
    }),
    new Lookup().clone<Lookup>({
      enName: 'Villa',
      arName: 'فلل',
      lookupKey: 4,
    }),
    new Lookup().clone<Lookup>({
      enName: 'Residental Complex',
      arName: 'مجمع سكني',
      lookupKey: 5,
    }),
    new Lookup().clone<Lookup>({
      enName: 'Apartment',
      arName: 'شقة',
      lookupKey: 6,
    }),
  ];

  updateDuration(type: DurationEndpoints) {
    this.selectedDurationType = type;
  }
}

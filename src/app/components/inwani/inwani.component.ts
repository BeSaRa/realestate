import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ElementReferenceDirective } from '@directives/element-reference.directive';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-inwani',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, ElementReferenceDirective],
  templateUrl: './inwani.component.html',
  styleUrls: ['./inwani.component.scss'],
})
export class InwaniComponent {
  fb = inject(NonNullableFormBuilder);

  lang = inject(TranslationService);

  numberPattern = /^\d+$/;
  form = this.fb.group({
    building: ['', [Validators.required, Validators.pattern(this.numberPattern)]],
    zone: ['', [Validators.required, Validators.pattern(this.numberPattern)]],
    street: ['', [Validators.required, Validators.pattern(this.numberPattern)]],
  });

  get building() {
    return this.form.controls.building;
  }
  get zone() {
    return this.form.controls.zone;
  }
  get street() {
    return this.form.controls.street;
  }

  get href() {
    return `https://geoportal.gisqatar.org.qa/inwani/index.html?zone=${this.zone.value}&street=${this.street.value}&building=${this.building.value}`;
  }
}

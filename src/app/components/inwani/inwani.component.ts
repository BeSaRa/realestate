import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-inwani',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inwani.component.html',
  styleUrls: ['./inwani.component.scss'],
})
export class InwaniComponent {
  fb = inject(NonNullableFormBuilder);

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
}

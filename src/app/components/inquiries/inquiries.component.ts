import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElementReferenceDirective } from '@directives/element-reference.directive';

@Component({
  selector: 'app-inquiries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, ElementReferenceDirective],
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.scss'],
})
export class InquiriesComponent {
  search = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d+$/)] });
}

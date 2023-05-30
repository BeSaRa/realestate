import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-inquiries',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './inquiries.component.html',
  styleUrls: ['./inquiries.component.scss'],
})
export class InquiriesComponent {}

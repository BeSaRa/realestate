import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-address-inquiry',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './address-inquiry.component.html',
  styleUrls: ['./address-inquiry.component.scss'],
})
export class AddressInquiryComponent {}

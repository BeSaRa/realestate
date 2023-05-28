import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtraHeaderComponent } from '../../components/extra-header/extra-header.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ExtraHeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export default class LandingPageComponent {}

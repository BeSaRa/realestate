import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, NgOptimizedImage],
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {}

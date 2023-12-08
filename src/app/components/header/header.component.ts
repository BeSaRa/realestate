import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@services/auth.service';
import { StickyService } from '@services/sticky.service';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { TopHeaderComponent } from '../top-header/top-header.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TopHeaderComponent, NgOptimizedImage, MainHeaderComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  authService = inject(AuthService);
  stickyService = inject(StickyService);
  isSticky = computed(() => this.stickyService.isSticky());
}

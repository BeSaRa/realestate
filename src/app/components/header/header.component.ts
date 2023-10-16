import { Component, Output, computed, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { MainHeaderComponent } from '../main-header/main-header.component';
import { StickyService } from '@services/sticky.service';
import { CmsAuthenticationService } from '@services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TopHeaderComponent, NgOptimizedImage, MainHeaderComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  authService = inject (CmsAuthenticationService)
  stickyService = inject(StickyService);
  isSticky = computed(() => this.stickyService.isSticky());
  isAuthenticated: boolean = false;

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe( authenticated =>
      this.isAuthenticated = authenticated
    )
  }
}

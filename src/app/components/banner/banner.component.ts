import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { TranslationService } from '@services/translation.service';
import { MenuItem } from '@models/menu-item';
import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
  lang = inject(TranslationService);
  menuService = inject(MenuService);
  recentMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.menuService.loadMenus().subscribe((menus) => (this.recentMenuItems = menus.recent));
  }
}

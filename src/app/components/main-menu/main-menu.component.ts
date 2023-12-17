import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { Menu } from '@models/menu';
import { MenuItem } from '@models/menu-item';
import { MenuService } from '@services/menu.service';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ButtonComponent, RouterModule, MatMenuModule],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent extends OnDestroyMixin(class {}) implements OnInit {
  http = inject(HttpClient);
  urlService = inject(UrlService);
  lang = inject(TranslationService);
  sticky = inject(StickyService);
  menuService = inject(MenuService);

  mainMenu!: Menu;

  isIndicatorsMenuOpened = false;

  ngOnInit(): void {
    this.menuService.loadMenus().subscribe((menus) => {
      this.mainMenu = menus.main_menu;
    });
  }

  addClick(item: MenuItem): void {
    item.recent ? item.clicked().pipe(takeUntil(this.destroy$)).subscribe() : null;
  }
}

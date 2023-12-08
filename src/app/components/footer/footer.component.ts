import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { TranslationService } from '@services/translation.service';
import { VersionComponent } from '../../standalone/version/version.component';
import { MenuService } from '@services/menu.service';
import { Menu } from '@models/menu';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, IconButtonComponent, NgOptimizedImage, VersionComponent],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  lang = inject(TranslationService);
  menuService = inject(MenuService);

  footerMenu!: Menu;

  ngOnInit(): void {
    this.menuService.loadMenus().subscribe((menus) => (this.footerMenu = menus.footer_menu));
  }
}

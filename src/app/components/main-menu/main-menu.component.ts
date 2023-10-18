import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ButtonComponent } from '@components/button/button.component';
import { OnDestroyMixin } from '@mixins/on-destroy-mixin';
import { MainMenu } from '@models/main-menu';
import { RouterModule } from '@angular/router';
import { DirectusClientService } from '@services/directus-client.service';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';
import { UrlService } from '@services/url.service';
import { Observable, from, switchMap, takeUntil, tap } from 'rxjs';
import { CastResponse } from 'cast-response';
import { MenuItem } from '@models/menu-item';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ButtonComponent, RouterModule],
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent extends OnDestroyMixin(class { }) implements OnInit {
  http = inject(HttpClient);
  urlService = inject(UrlService);
  directusClient = inject(DirectusClientService);
  lang = inject(TranslationService);
  sticky = inject(StickyService);

  mainMenu!: MainMenu;

  @Input() isAuthenticated: boolean = false;

  ngOnInit(): void {
    this.load().subscribe( x => 
      this.mainMenu = x);
  }
  
  @CastResponse(() => MainMenu, { unwrap:'main_menu', shape: { 'items.*': () => MenuItem } })
  load(): Observable<MainMenu> {
    return this.http
      .get<MainMenu>(this.urlService.URLS.MAIN_MENU)
      .pipe(
        takeUntil(this.destroy$),
        tap((_mainMenu) => {
          return new MainMenu().clone<MainMenu>({
            id: _mainMenu.id,
            items: _mainMenu.items,
            key: _mainMenu.key,
            status: _mainMenu.status,
            title: _mainMenu.title
          })
        })
      )
  }
}




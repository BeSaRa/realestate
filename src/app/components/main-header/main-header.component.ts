import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { IconButtonComponent } from '@components/icon-button/icon-button.component';
import { Link } from '@models/link.model';
import { CmsAuthenticationService } from '@services/auth.service';
import { LinkService } from '@services/link.service';
import { SideBarService } from '@services/side-bar.service';
import { StickyService } from '@services/sticky.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, IconButtonComponent],
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent implements OnInit {

  lang = inject(TranslationService);
  sticky = inject(StickyService);
  authService = inject(CmsAuthenticationService)
  sideBarService = inject(SideBarService);
  linkService = inject(LinkService);
  links: Link[] = [];
  @Input() isAuthenticated: boolean = false;

  ngOnInit(): void {
    this.linkService.getLinks().subscribe((links) => {
      this.links = links;
    });
    
  }
  
  changeLang(event: Event) {
    event.preventDefault();
    this.lang.toggleLang();
  }
}

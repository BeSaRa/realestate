import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { AppIcons } from '@constants/app-icons';
import { ClickOutsideDirective } from '@directives/click-outside.directive';
import { DataInfoService } from '@services/data-info.service';
import { TranslationService } from '@services/translation.service';

@Component({
  selector: 'app-data-info',
  standalone: true,
  imports: [CommonModule, MatIconModule, ClickOutsideDirective],
  templateUrl: './data-info.component.html',
  styleUrls: ['./data-info.component.scss'],
})
export class DataInfoComponent implements OnInit {
  lang = inject(TranslationService);
  dataInfoService = inject(DataInfoService);
  router = inject(Router);

  icons = AppIcons;
  isOpened = false;

  @HostBinding('class.right-0') get alignRight() {
    return this.lang.isLtr;
  }

  @HostBinding('class.left-0') get alignLeft() {
    return !this.lang.isLtr;
  }

  @HostBinding('class.-translate-x-72') get translateLeft() {
    return !this.isOpened && !this.lang.isLtr;
  }

  @HostBinding('class.translate-x-72') get translateRight() {
    return !this.isOpened && this.lang.isLtr;
  }

  ngOnInit(): void {
    this._listenToRouteChange();
  }

  toggleOpened(event: MouseEvent) {
    this.isOpened = !this.isOpened;
    event.stopImmediatePropagation();
  }

  private _listenToRouteChange() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isOpened = false;
      }
    });
  }

  outsideClicked() {
    if (this.isOpened) this.isOpened = false;
  }
}

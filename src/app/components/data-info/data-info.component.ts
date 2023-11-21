import { Component, HostBinding, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataInfoService } from '@services/data-info.service';
import { TranslationService } from '@services/translation.service';
import { MatIconModule } from '@angular/material/icon';
import { AppIcons } from '@constants/app-icons';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-data-info',
  standalone: true,
  imports: [CommonModule, MatIconModule],
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

  ngOnInit(): void {
    this._listenToRouteChange();
    this._listenToPageClick();
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

  private _listenToPageClick() {
    document.querySelector('body')?.addEventListener('click', () => {
      if (this.isOpened) {
        this.isOpened = false;
      }
    });
  }
}

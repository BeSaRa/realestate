import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { LangCodes } from '@enums/lang-codes';
import { TranslationService } from '@services/translation.service';
import { TranslationPopupComponent } from '@components/translation-popup/translation-popup.component';
import { DialogService } from '@services/dialog.service';

@Component({
  selector: 'app-external',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, ButtonComponent],
  templateUrl: './external.component.html',
  styleUrl: './external.component.scss',
})
export class ExternalComponent implements OnInit {
  lang = inject(TranslationService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(DialogService);

  @HostListener('window:keydown.control.alt.ش')
  @HostListener('window:keydown.control.alt.a')
  openTranslationPopup() {
    this.dialog.open(TranslationPopupComponent);
  }

  ngOnInit(): void {
    const _langCode = this.route.snapshot.queryParamMap.get('lang') ?? LangCodes.AR;
    this.lang.setCurrent(this.lang.getLang(_langCode));
    this.listenToLanguageChange();
  }

  changeLang(event: Event) {
    event.preventDefault();
    this.lang.toggleLang();
  }

  private listenToLanguageChange() {
    this.lang.change$.subscribe((lang) => {
      const currentLang = lang.code.split('-').shift();
      this.router
        .navigate([], { relativeTo: this.route, queryParams: { lang: currentLang }, queryParamsHandling: 'merge' })
        .then();
    });
  }
}

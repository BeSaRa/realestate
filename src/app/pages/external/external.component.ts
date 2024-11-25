import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import { ButtonComponent } from '@components/button/button.component';
import { LangCodes } from '@enums/lang-codes';
import { TranslationService } from '@services/translation.service';

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

  ngOnInit(): void {
    const _langCode = this.route.snapshot.queryParamMap.get('lang') ?? LangCodes.AR;
    this.lang.setCurrent(this.lang.getLang(_langCode));
  }

  changeLang(event: Event) {
    event.preventDefault();
    this.lang.toggleLang();
  }
}

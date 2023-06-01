import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LawService } from '@services/law.service';

@Component({
  selector: 'app-law-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './law-page.component.html',
  styleUrls: ['./law-page.component.scss'],
})
export default class LawPageComponent {
  lawService = inject(LawService);
  lawData$ = this.lawService.load();
}

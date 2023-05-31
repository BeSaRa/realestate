import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Page } from '@models/page';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export default class PageComponent {
  @Input() pageData!: Page;
}

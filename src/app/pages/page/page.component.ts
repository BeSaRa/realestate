import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Page } from '@models/page';
import { ExtraHeaderComponent } from '@components/extra-header/extra-header.component';
import { SafeHtmlPipe } from '@pipes/safe-html.pipe';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ExtraHeaderComponent, SafeHtmlPipe],
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export default class PageComponent {
  @Input() pageData!: Page;
}

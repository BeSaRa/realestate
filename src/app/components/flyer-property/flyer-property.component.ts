import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Lookup } from '@models/lookup';

@Component({
  selector: 'app-flyer-property',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flyer-property.component.html',
  styleUrls: ['./flyer-property.component.scss'],
})
export class FlyerPropertyComponent {
  @Input({ required: true }) item!: Lookup;

  getIconUrl() {
    return `assets/icons/flyer/${this.item.lookupKey}.png`;
  }
}

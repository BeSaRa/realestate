import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-price-range',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-range.component.html',
  styleUrls: ['./price-range.component.scss'],
})
export class PriceRangeComponent {
  prices = [5, 10, 15, 20, 25, 30];
  contractsCount = [649, 1060, 649, 750, 750, 156, 16];

  getX(value: number) {
    return 110 - (value / this.prices[this.prices.length - 1]) * 90;
  }

  getCountX(index: number) {
    if (index === 0) return this.getX(this.prices[0]) + (this.getX(this.prices[0]) - this.getX(this.prices[1])) / 2;
    if (index === this.prices.length)
      return (
        this.getX(this.prices[this.prices.length - 1]) - (this.getX(this.prices[0]) - this.getX(this.prices[1])) / 2
      );
    return (this.getX(this.prices[index]) + this.getX(this.prices[index - 1])) / 2;
  }
}

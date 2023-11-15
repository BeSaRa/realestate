import { ComponentFixture, TestBed } from '@angular/core/testing';

import BrokerIndicatorsPageComponent from './broker-indicators-page.component';

describe('BrokerIndicatorsPageComponent', () => {
  let component: BrokerIndicatorsPageComponent;
  let fixture: ComponentFixture<BrokerIndicatorsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrokerIndicatorsPageComponent],
    });
    fixture = TestBed.createComponent(BrokerIndicatorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

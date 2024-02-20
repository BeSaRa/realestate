import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralSecretariatPageComponent } from './general-secretariat-page.component';

describe('GeneralSecretariatPageComponent', () => {
  let component: GeneralSecretariatPageComponent;
  let fixture: ComponentFixture<GeneralSecretariatPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralSecretariatPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneralSecretariatPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalleC } from './salle-c';

describe('SalleC', () => {
  let component: SalleC;
  let fixture: ComponentFixture<SalleC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalleC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalleC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

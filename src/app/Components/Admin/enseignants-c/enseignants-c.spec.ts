import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnseignantsC } from './enseignants-c';

describe('EnseignantsC', () => {
  let component: EnseignantsC;
  let fixture: ComponentFixture<EnseignantsC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnseignantsC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnseignantsC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

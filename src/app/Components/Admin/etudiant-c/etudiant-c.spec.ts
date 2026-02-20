import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtudiantC } from './etudiant-c';

describe('EtudiantC', () => {
  let component: EtudiantC;
  let fixture: ComponentFixture<EtudiantC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtudiantC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EtudiantC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

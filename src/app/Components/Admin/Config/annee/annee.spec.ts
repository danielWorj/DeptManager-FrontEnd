import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Annee } from './annee';

describe('Annee', () => {
  let component: Annee;
  let fixture: ComponentFixture<Annee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Annee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Annee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

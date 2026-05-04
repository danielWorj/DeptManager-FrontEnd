import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Departements } from './departements';

describe('Departements', () => {
  let component: Departements;
  let fixture: ComponentFixture<Departements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Departements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Departements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

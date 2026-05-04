import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequeteC } from './requete';

describe('RequeteC', () => {
  let component: RequeteC;
  let fixture: ComponentFixture<RequeteC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequeteC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequeteC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

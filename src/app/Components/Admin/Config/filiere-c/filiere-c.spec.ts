import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiliereC } from './filiere-c';

describe('FiliereC', () => {
  let component: FiliereC;
  let fixture: ComponentFixture<FiliereC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiliereC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiliereC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

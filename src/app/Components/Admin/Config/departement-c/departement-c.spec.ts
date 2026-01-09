import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartementC } from './departement-c';

describe('DepartementC', () => {
  let component: DepartementC;
  let fixture: ComponentFixture<DepartementC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartementC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartementC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

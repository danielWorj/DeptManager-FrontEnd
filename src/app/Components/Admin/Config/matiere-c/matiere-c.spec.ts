import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatiereC } from './matiere-c';

describe('MatiereC', () => {
  let component: MatiereC;
  let fixture: ComponentFixture<MatiereC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatiereC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatiereC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

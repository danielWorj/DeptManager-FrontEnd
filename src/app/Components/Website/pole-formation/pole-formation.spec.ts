import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoleFormation } from './pole-formation';

describe('PoleFormation', () => {
  let component: PoleFormation;
  let fixture: ComponentFixture<PoleFormation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoleFormation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoleFormation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

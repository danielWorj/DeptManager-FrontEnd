import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Repartition } from './repartition';

describe('Repartition', () => {
  let component: Repartition;
  let fixture: ComponentFixture<Repartition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Repartition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Repartition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

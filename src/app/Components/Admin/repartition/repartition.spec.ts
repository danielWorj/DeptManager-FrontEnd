import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepartitionC } from './repartition';

describe('RepartitionC', () => {
  let component: RepartitionC;
  let fixture: ComponentFixture<RepartitionC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepartitionC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepartitionC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

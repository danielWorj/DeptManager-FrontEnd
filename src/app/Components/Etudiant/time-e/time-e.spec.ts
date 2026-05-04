import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeE } from './time-e';

describe('TimeE', () => {
  let component: TimeE;
  let fixture: ComponentFixture<TimeE>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeE]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeE);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualiteE } from './actualite';

describe('ActualiteE', () => {
  let component: ActualiteE;
  let fixture: ComponentFixture<ActualiteE>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualiteE]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualiteE);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

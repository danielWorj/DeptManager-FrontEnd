import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequeteE } from './requete';

describe('RequeteE', () => {
  let component: RequeteE;
  let fixture: ComponentFixture<RequeteE>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequeteE]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequeteE);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

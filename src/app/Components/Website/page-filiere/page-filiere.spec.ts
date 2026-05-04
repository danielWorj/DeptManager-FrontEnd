import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageFiliere } from './page-filiere';

describe('PageFiliere', () => {
  let component: PageFiliere;
  let fixture: ComponentFixture<PageFiliere>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageFiliere]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageFiliere);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

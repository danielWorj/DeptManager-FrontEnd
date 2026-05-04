import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageDepartement } from './page-departement';

describe('PageDepartement', () => {
  let component: PageDepartement;
  let fixture: ComponentFixture<PageDepartement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDepartement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageDepartement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

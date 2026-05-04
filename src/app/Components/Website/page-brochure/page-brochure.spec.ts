import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageBrochure } from './page-brochure';

describe('PageBrochure', () => {
  let component: PageBrochure;
  let fixture: ComponentFixture<PageBrochure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageBrochure]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageBrochure);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

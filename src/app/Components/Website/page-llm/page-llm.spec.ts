import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLlm } from './page-llm';

describe('PageLlm', () => {
  let component: PageLlm;
  let fixture: ComponentFixture<PageLlm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLlm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageLlm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

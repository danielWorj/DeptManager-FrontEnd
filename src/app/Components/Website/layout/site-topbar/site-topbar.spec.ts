import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteTopbar } from './site-topbar';

describe('SiteTopbar', () => {
  let component: SiteTopbar;
  let fixture: ComponentFixture<SiteTopbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteTopbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteTopbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

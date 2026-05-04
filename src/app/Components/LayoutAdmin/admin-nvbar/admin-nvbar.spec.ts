import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNvbar } from './admin-nvbar';

describe('AdminNvbar', () => {
  let component: AdminNvbar;
  let fixture: ComponentFixture<AdminNvbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNvbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNvbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

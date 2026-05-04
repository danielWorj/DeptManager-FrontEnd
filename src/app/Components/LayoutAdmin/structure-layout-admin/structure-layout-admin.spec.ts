import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureLayoutAdmin } from './structure-layout-admin';

describe('StructureLayoutAdmin', () => {
  let component: StructureLayoutAdmin;
  let fixture: ComponentFixture<StructureLayoutAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureLayoutAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureLayoutAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

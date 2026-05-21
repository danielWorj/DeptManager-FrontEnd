import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBase } from './data-base';

describe('DataBase', () => {
  let component: DataBase;
  let fixture: ComponentFixture<DataBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataBase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

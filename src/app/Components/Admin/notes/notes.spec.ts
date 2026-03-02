import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesC } from './notes';

describe('NotesC', () => {
  let component: NotesC;
  let fixture: ComponentFixture<NotesC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotesC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

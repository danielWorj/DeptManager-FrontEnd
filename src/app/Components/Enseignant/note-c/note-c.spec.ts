import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteC } from './note-c';

describe('NoteC', () => {
  let component: NoteC;
  let fixture: ComponentFixture<NoteC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoteC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

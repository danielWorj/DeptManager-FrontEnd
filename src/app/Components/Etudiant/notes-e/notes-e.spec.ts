import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesE } from './notes-e';

describe('NotesE', () => {
  let component: NotesE;
  let fixture: ComponentFixture<NotesE>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesE]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotesE);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
